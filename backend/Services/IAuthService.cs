using backend.Dto;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterRequest request);
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request);
        Task<UserInfoResponse?> GetUserInfoAsync(int userId);
        Task<bool> LogoutAsync(int userId);
        //Task<bool> UpdateUserStatusAsync(int userId, string decision);
    }
}
