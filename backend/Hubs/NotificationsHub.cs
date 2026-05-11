using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace backend.Hubs
{
    [Authorize]
    public class NotificationsHub : Hub
    {
        public static string OwnerGroup(int ownerId) => $"owner:{ownerId}";
        public const string  AdminGroup = "Admins";

        public override async Task OnConnectedAsync()
        {
            var raw = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (raw is not null && int.TryParse(raw, out var userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, OwnerGroup(userId));
            }

            if (Context.User?.IsInRole("Admin") == true)
            { 
                await Groups.AddToGroupAsync(Context.ConnectionId, AdminGroup);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var raw = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (raw is not null && int.TryParse(raw, out var userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, OwnerGroup(userId));
            }

            if (Context.User?.IsInRole("Admin") == true)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, AdminGroup);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}

