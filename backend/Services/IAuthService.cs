using backend.Dto;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<UserInfoResponse?> RegisterAsync(RegisterRequest request);
        Task<(UserInfoResponse? User, string? Token, string? Error)> LoginAsync(LoginRequest request);
        Task<bool> UpdateUserStatusAsync(int userId, string decision);
    }
}
