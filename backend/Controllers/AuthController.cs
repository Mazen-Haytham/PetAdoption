using backend.Dto;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<UserInfoResponse>> Register(RegisterRequest request)
        {
            var user = await authService.RegisterAsync(request);

            if (user is null)
            {
                return BadRequest(new { error = "Email already exists." });
            }

            return Ok(new { user });
        }
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginRequest request)
        {
            var (userInfo, token, error) = await authService.LoginAsync(request);

            if (error is not null) return BadRequest(new { error });

            return Ok(new { token, user = userInfo });
        }

        [HttpPatch("users/{userId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] ApprovalRequest request)
        {
            try
            {
                var result = await authService.UpdateUserStatusAsync(userId, request.Decision);

                if (!result) return NotFound(new { error = "User not found." });

                return NoContent(); // 204
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "Invalid decision. Use 'approve' or 'reject'." });
            }
        }
    }
}


// PATCH /api/auth/users/5/status with body { "decision": "approve or reject" }