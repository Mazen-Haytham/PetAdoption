using backend.Data;
using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public enum RegisterableRole
    {
        Adopter = 1,
        Owner = 2
    }
    public class RegisterRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public RegisterableRole Role { get; set; }
    }


    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
    public record LoginResponse(
    UserInfoResponse? User,
    TokenResponseDto? TokenResponse,
    string? Error
);

    public class TokenResponseDto
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
    public class RefreshTokenRequestDto
    {
        public int UserId { get; set; }
        public required string RefreshToken { get; set; }
    }

    public record ApprovalRequest(string Decision);

    public record UserInfoResponse(
    int UserId,
    string Name,
    string Email,
    string Role,
    ICollection<UserFavourite> UserFavourites
);
}

