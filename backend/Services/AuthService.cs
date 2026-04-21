using backend.Dto;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace backend.Services
{
    public class AuthService(AppDbContext context, IConfiguration configuration) : IAuthService
    {
        public async Task<UserInfoResponse?> RegisterAsync(RegisterRequest request)
        {
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return null;
            }

            var user = new User();
            var hashedPassword = new PasswordHasher<User>().HashPassword(user, request.Password);

            user.Name = request.Name;
            user.Email = request.Email;
            user.Password = hashedPassword;
            user.Role = request.Role;
            user.Status = user.Role == UserRole.Adopter ? AccountStatus.Approved : AccountStatus.Pending;

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var response = new UserInfoResponse(user.Name, user.Email, user.Role.ToString(), user.UserFavourites);

            return response;
        }
        public async Task<(UserInfoResponse? User, string? Token, string? Error)> LoginAsync(LoginRequest request)
        {
            var user = await context.Users
            .Include(u => u.UserFavourites)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user is null) return (null, null, "Invalid credentials.");

            if (user.Status == AccountStatus.Rejected)
                return (null, null, "Your account has been rejected.");

            if (user.Status == AccountStatus.Pending)
                return (null, null, "Your account is still pending approval.");

            if (new PasswordHasher<User>()
                .VerifyHashedPassword(user, user.Password, request.Password)
                    == PasswordVerificationResult.Failed)
                return (null, null, "Invalid credentials.");

            var response = new UserInfoResponse(user.Name, user.Email, user.Role.ToString(),user.UserFavourites);

            return (response, CreateToken(user), null);
        }

        public async Task<bool> UpdateUserStatusAsync(int userId, string decision)
        {
            var user = await context.Users.FindAsync(userId);

            if (user is null) return false;

            user.Status = decision.ToLower() switch
            {
                "approve" => AccountStatus.Approved,
                "reject" => AccountStatus.Rejected,
                _ => throw new ArgumentException($"Invalid decision: {decision}")
            };

            await context.SaveChangesAsync();
            return true;
        }
        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
                );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
