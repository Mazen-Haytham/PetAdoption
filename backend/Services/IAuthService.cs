using backend.Dto;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(RegisterRequest request);
        Task<(string? Token,string? Error)> LoginAsync(LoginRequest request);
        Task<bool> UpdateUserStatusAsync(int userId, string decision);
    }
}
