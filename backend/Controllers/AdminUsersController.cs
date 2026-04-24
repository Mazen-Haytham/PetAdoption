using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController(IAdminUserService adminUserService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? role,
            [FromQuery] string? status)
        {
            try
            {
                var users = await adminUserService.GetUsersAsync(role, status);

                return Ok(new
                {
                    success = true,
                    data = users
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await adminUserService.GetUserByIdAsync(id);

            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new
            {
                success = true,
                data = user
            });
        }
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveUser(int id)
        {
            var result = await adminUserService.ApproveUserAsync(id);

            if (!result)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new
            {
                success = true,
                message = "User approved successfully"
            });
        }
        [HttpPut("reject/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectUser(int id)
        {
            var result = await adminUserService.RejectUserAsync(id);

            if (!result)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new
            {
                success = true,
                message = "User rejected successfully"
            });
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await adminUserService.DeleteUserAsync(id);

            if (!result)
                return NotFound(new
                {
                    success = false,
                    message = "User not found"
                });

            return Ok(new
            {
                success = true,
                message = "User deleted successfully"
            });
        }
    }


}