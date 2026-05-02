using backend.Reviews.DTOs;
using backend.Reviews.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Reviews.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewsService _reviewsService;

        public ReviewsController(IReviewsService reviewsService)
        {
            _reviewsService = reviewsService;
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return raw is not null && int.TryParse(raw, out userId);
        }

        // POST /api/reviews
        // Body: { adoptionId, rating, comment }
        [HttpPost]
        [Authorize(Roles = "Adopter")]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!TryGetUserId(out var adopterId))
                return Unauthorized(new { success = false, message = "Missing or invalid user id claim." });

            try
            {
                var (success, message) = await _reviewsService.AddReviewAsync(adopterId, dto);

                if (!success)
                    return BadRequest(new { success, message });

                return Ok(new { success = true, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/reviews/{ownerId}
        [HttpGet("{ownerId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviews(int ownerId)
        {
            try
            {
                var reviews = await _reviewsService.GetReviewsByOwnerIdAsync(ownerId);

                return Ok(new
                {
                    success = true,
                    count = reviews.Count,
                    data = reviews.Select(r => new
                    {
                        id = r.Id,
                        reviewer = r.ReviewerName,
                        rating = r.Rating,
                        comment = r.Comment,
                        date = r.Date.ToString("yyyy-MM-dd")
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
