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
            var (userInfo, tokenResponse, error) = await authService.LoginAsync(request);

            if (error is not null) return BadRequest(new { error });

            return Ok(new { tokenResponse, user = userInfo });
        }


        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
        {
            var response = await authService.RefreshTokensAsync(request);
            if (response is null || response.AccessToken is null || response.RefreshToken is null)
                return Unauthorized("Invalid refresh token");
            return Ok(response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await authService.LogoutAsync(userId);
            return Ok(new { message = "Logged out successfully" });
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