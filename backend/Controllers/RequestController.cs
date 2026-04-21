using backend.Requests.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Requests.Controllers
{
    [ApiController]
    [Route("api/adoptionRequests")]
    public class RequestController : ControllerBase
    {
        private readonly IRequestService _requestService;

        public RequestController(IRequestService requestService)
        {
            _requestService = requestService;
        }

        // GET /api/requests
        [HttpGet]
        public async Task<IActionResult> GetRequests()
        {
            try
            {
                // TODO: replace with JWT claim
                var ownerId = 1;

                var requests = await _requestService.GetRequestsByOwnerIdAsync(ownerId);

                return Ok(new
                {
                    success = true,
                    count = requests.Count,
                    data = requests
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // PUT /api/requests/{id}/accept
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptRequest(int id)
        {
            try
            {
                // TODO: replace with JWT claim
                var ownerId = 1;

                var (success, message) = await _requestService.AcceptRequestAsync(id, ownerId);

                if (!success)
                    return BadRequest(new { success, message });

                return Ok(new { success, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // PUT /api/requests/{id}/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            try
            {
                // TODO: replace with JWT claim
                var ownerId = 1;

                var (success, message) = await _requestService.RejectRequestAsync(id, ownerId);

                if (!success)
                    return BadRequest(new { success, message });

                return Ok(new { success, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}