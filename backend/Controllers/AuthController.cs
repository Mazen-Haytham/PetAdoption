using backend.Dto;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await authService.RegisterAsync(request);

            if (!result)
            {
                return BadRequest(new { error = "Email Already Exists" });
            }

            return Created();
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<string>> Login(LoginRequest request)
        {
            var (tokenResponse, error) = await authService.LoginAsync(request);

            if (error is not null || tokenResponse is null ) return BadRequest(new { error });

            SetRefreshTokenCookie(tokenResponse.RefreshToken);

            return Ok(new
            {
                tokenResponse = new { tokenResponse.AccessToken }
            });
        }


        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("No refresh token found");

            var request = new RefreshTokenRequestDto { RefreshToken = refreshToken };

            var response = await authService.RefreshTokensAsync(request);

            if (response is null || response.AccessToken is null || response.RefreshToken is null)
                return Unauthorized("Invalid refresh token");

            SetRefreshTokenCookie(response.RefreshToken);

            return Ok(new { response.AccessToken });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfoResponse>> GetMe()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null)
                return Unauthorized("User not found in token");

            var userId = int.Parse(userIdClaim);
            var userInfo = await authService.GetUserInfoAsync(userId);

            if (userInfo is null)
                return NotFound(new { error = "User not found" });

            return Ok(userInfo);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            Response.Cookies.Delete("refreshToken");

            if (userIdClaim is null)
                return Unauthorized("User not found in token");

            var userId = int.Parse(userIdClaim);

            await authService.LogoutAsync(userId);


            return Ok(new { message = "Logged out successfully" });
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,                      // JS cannot read it
                Secure = true,                        // HTTPS only
                SameSite = SameSiteMode.Strict,       // CSRF protection
                Expires = DateTime.UtcNow.AddDays(7)  // match your token expiry
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}


// PATCH /api/auth/users/5/status with body { "decision": "approve or reject" }


//[HttpPatch("users/{userId}/status")]
//[Authorize(Roles = "Admin")]
//public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] ApprovalRequest request)
//{
//    try
//    {
//        var result = await authService.UpdateUserStatusAsync(userId, request.Decision);

//        if (!result) return NotFound(new { error = "User not found." });

//        return NoContent(); // 204
//    }
//    catch (ArgumentException ex)
//    {
//        return BadRequest(new { error = "Invalid decision. Use 'approve' or 'reject'." });
//    }
//}