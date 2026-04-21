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
        public async Task<ActionResult<User>> Register(RegisterRequest request)
        {
            var user = await authService.RegisterAsync(request);

            if (user is null)
            {
                return BadRequest(new { error = "Email already exists." });
            }

            return Ok(user);
        }
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginRequest request)
        {
            var (token, error) = await authService.LoginAsync(request);

            if (error is not null) return Unauthorized(new{error});

            return Ok(new { token });
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
                return BadRequest(ex.Message);
            }
        }

        // Testing Role Based Authorization
        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AuthenticatedOnlyEndpoint()
        {
            return Ok("you are admin!");
        }
        [Authorize(Roles = "Owner")]
        [HttpGet("owners-only")]
        public IActionResult AuthenticatedOnlyEndpoint1()
        {
            return Ok("you are owner!");
        }
        [Authorize(Roles = "Adopter")]
        [HttpGet("adopter-only")]
        public IActionResult AuthenticatedOnlyEndpoint2()
        {
            return Ok("you are owner!");
        }
    }
}


// PATCH /api/auth/users/5/status with body { "decision": "approve or reject" }