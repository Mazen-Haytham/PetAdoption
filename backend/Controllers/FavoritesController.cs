using backend.Favorites.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Favorites.Controllers
{
    [ApiController]
    [Route("api/favorites")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoritesService _favoritesService;

        public FavoritesController(IFavoritesService favoritesService)
        {
            _favoritesService = favoritesService;
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return raw is not null && int.TryParse(raw, out userId);
        }

        // POST /api/favorites/{petPostId}
        [HttpPost("{petPostId}")]
        [Authorize(Roles = "Adopter")]
        public async Task<IActionResult> AddFavorite(int petPostId)
        {
            if (!TryGetUserId(out var adopterId))
                return Unauthorized(new { success = false, message = "Missing or invalid user id claim." });

            var (success, message) = await _favoritesService.AddFavoriteAsync(adopterId, petPostId);

            if (!success)
                return BadRequest(new { success, message });

            return Ok(new { success = true, message });
        }

        // DELETE /api/favorites/{petPostId}
        [HttpDelete("{petPostId}")]
        [Authorize(Roles = "Adopter")]
        public async Task<IActionResult> RemoveFavorite(int petPostId)
        {
            if (!TryGetUserId(out var adopterId))
                return Unauthorized(new { success = false, message = "Missing or invalid user id claim." });

            var (success, message) = await _favoritesService.RemoveFavoriteAsync(adopterId, petPostId);

            if (!success)
                return NotFound(new { success, message });

            return Ok(new { success = true, message });
        }

        // GET /api/favorites
        [HttpGet]
        [Authorize(Roles = "Adopter")]
        public async Task<IActionResult> GetFavorites()
        {
            if (!TryGetUserId(out var adopterId))
                return Unauthorized(new { success = false, message = "Missing or invalid user id claim." });

            try
            {
                var favorites = await _favoritesService.GetFavoritesAsync(adopterId);

                return Ok(new
                {
                    success = true,
                    count = favorites.Count,
                    data = favorites
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
