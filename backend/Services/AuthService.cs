using backend.Data;
using backend.Dto;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
namespace backend.Services
{
    public class AuthService(AppDbContext context, IConfiguration configuration) : IAuthService
    {
        private readonly PasswordHasher<User> _passwordHasher = new();

        // public methods

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return false;
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Role = (UserRole)request.Role,
            };
            var hashedPassword = _passwordHasher.HashPassword(user, request.Password);

            user.Password = hashedPassword;
            user.Status = user.Role == UserRole.Adopter ? AccountStatus.Approved : AccountStatus.Pending;

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return true;
        }


        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await context.Users
            .Include(u => u.UserFavourites)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user is null)
                return new LoginResponse(null, "Invalid credentials.");

            if (user.Status == AccountStatus.Rejected)
                return new LoginResponse(null, "Your account has been rejected.");

            if (user.Status == AccountStatus.Pending)
                return new LoginResponse(null, "Your account is still pending approval.");

            if (_passwordHasher.VerifyHashedPassword(user, user.Password, request.Password)
                    == PasswordVerificationResult.Failed)
                return new LoginResponse(null, "Invalid credentials.");

            var userInfo = new UserInfoResponse(
                user.Id, 
                user.Name, 
                user.Email, 
                user.Role.ToString(), 
                user.UserFavourites ?? new List<UserFavourite>()
                );
            var tokenResponse = await CreateTokenResponse(user);

            return new LoginResponse(tokenResponse, null);
        }

        public async Task<UserInfoResponse?> GetUserInfoAsync(int userId)
        {
            var user = await context.Users
                .Include(u => u.UserFavourites)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null) return null;

            return new UserInfoResponse(
                user.Id,
                user.Name,
                user.Email,
                user.Role.ToString(),
                user.UserFavourites ?? new List<UserFavourite>()
            );
        }

        public async Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request)
        {
            var user = await ValidateRefreshTokenAsync(request.RefreshToken);
            if (user is null)
                return null;
            return await CreateTokenResponse(user);
        }


        public async Task<bool> LogoutAsync(int userId)
        {
            var user = await context.Users.FindAsync(userId);
            if (user is null) return false;

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await context.SaveChangesAsync();
            return true;
        }

        // private methods 3l4an el logic 
        // refresh token
        
        private async Task<TokenResponseDto> CreateTokenResponse(User user)
        {
            return new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
            };
        }
        private async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user is null || user.RefreshTokenExpiryTime <= DateTime.UtcNow || user.Status != AccountStatus.Approved) return null;

            return user;
        }
        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await context.SaveChangesAsync();
            return refreshToken;
        }
        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
        // jwt only logic "Access Token" expire in 15 min
        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")
                ?? throw new InvalidOperationException("JWT secret is not configured")));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(configuration.GetValue<int>("AppSettings:TokenExpiryMinutes")),
                signingCredentials: creds
                );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}



//public async Task<bool> UpdateUserStatusAsync(int userId, string decision)
//{
//    var user = await context.Users.FindAsync(userId);

//    if (user is null) return false;

//    user.Status = decision.ToLower() switch
//    {
//        "approve" => AccountStatus.Approved,
//        "reject" => AccountStatus.Rejected,
//        _ => throw new ArgumentException($"Invalid decision: {decision}")
//    };

//    await context.SaveChangesAsync();
//    return true;
//}