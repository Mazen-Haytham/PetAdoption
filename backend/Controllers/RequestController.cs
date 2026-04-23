using backend.Requests.DTOs;
using backend.Requests.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Requests.Controllers
{
    [ApiController]
    [Route("api/adoptions")]
    public class RequestController : ControllerBase
    {
        private readonly IRequestService _requestService;

        public RequestController(IRequestService requestService)
        {
            _requestService = requestService;
        }

        // POST /api/adoptions
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAdoptionRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // TODO: replace with JWT claim
                var adopterId = 1;

                var (success, message, requestId) =
                    await _requestService.CreateAdoptionRequestAsync(adopterId, dto.EffectivePetPostId, dto.Message);

                if (!success)
                    return BadRequest(new { success, message });

                return Ok(new
                {
                    success = true,
                    message,
                    data = new { id = requestId, status = "pending" }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/adoptions/received
        [HttpGet("received")]
        public async Task<IActionResult> Received()
        {
            try
            {
                // TODO: replace with JWT claim
                var ownerId = 1;

                var requests = await _requestService.GetRequestsByOwnerIdAsync(ownerId);

                return Ok(new { success = true, data = requests.Select(r => new
                {
                    id = r.RequestId,
                    pet = new { id = r.PetPostId, name = r.PetName },
                    adopter = new { id = r.AdopterId, name = r.AdopterName },
                    message = r.Message,
                    status = r.Status.ToLowerInvariant(),
                    createdAt = r.CreatedAt
                })});
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/adoptions/my
        [HttpGet("my")]
        public async Task<IActionResult> My()
        {
            try
            {
                // TODO: replace with JWT claim
                var adopterId = 1;

                var requests = await _requestService.GetMyRequestsAsync(adopterId);

                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/adoptions/history
        [HttpGet("history")]
        public async Task<IActionResult> History()
        {
            try
            {
                // TODO: replace with JWT claim
                var adopterId = 1;

                var history = await _requestService.GetAdoptionHistoryAsync(adopterId);

                return Ok(new { success = true, data = history });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // PUT /api/adoptions/{id}/accept
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

        // PUT /api/adoptions/{id}/reject
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