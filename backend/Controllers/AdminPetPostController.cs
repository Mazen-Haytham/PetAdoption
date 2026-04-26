using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin/pets")]
    [Authorize(Roles = "Admin")]
    public class AdminPetsController : ControllerBase
    {
        private readonly IAdminPetPostService _service;

        public AdminPetsController(IAdminPetPostService service)
        {
            _service = service;
        }

       
        [HttpGet]
        public async Task<IActionResult> GetPets(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var data = await _service.GetPetsAsync(status, page, pageSize);

            return Ok(new
            {
                success = true,
                data
            });
        }

        
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var result = await _service.ApprovePetAsync(id, adminId);

            if (!result)
                return NotFound(new { success = false });

            return Ok(new
            {
                success = true,
                message = "Pet approved successfully"
            });
        }

        
        [HttpPut("reject/{id}")]
        public async Task<IActionResult> Reject(int id)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var result = await _service.RejectPetAsync(id, adminId);

            if (!result)
                return NotFound(new { success = false });

            return Ok(new
            {
                success = true,
                message = "Pet rejected successfully"
            });
        }
    }
}