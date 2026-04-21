using backend.Dto;
using backend.Models;
using backend.Services;
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
    }
}
