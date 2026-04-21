using backend.Dto;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(RegisterRequest request);
        Task<string?> LoginAsync(LoginRequest request);

    }
}
