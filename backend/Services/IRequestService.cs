using backend.Requests.DTOs;

namespace backend.Requests.Services
{
    public interface IRequestService
    {
        Task<List<RequestResponseDto>> GetRequestsByOwnerIdAsync(int ownerId);
        Task<(bool Success, string Message)> AcceptRequestAsync(int requestId, int ownerId);
        Task<(bool Success, string Message)> RejectRequestAsync(int requestId, int ownerId);
    }
}