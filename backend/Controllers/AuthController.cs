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
        public static User user = new();

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(RegisterRequest request)
        {
            var user = await authService.RegisterAsync(request);

            if (user is null)
            {
                return BadRequest("Email Already Exists.");
            }

            return Ok(user);
        }
        [HttpGet("login")]
        public async Task<ActionResult<string>> Login(LoginRequest request)
        {
            var token = await authService.LoginAsync(request);

            if (token is null)
            {
                return BadRequest("Invalid Email Or Password. ");
            }

            return Ok(token);
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
