using backend.Pets.DTOs;
using backend.Pets.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Pets.Controllers
{
    [ApiController]
    [Route("api/pets")]
    public class PetController : ControllerBase
    {
        private readonly IPetService _petService;

        public PetController(IPetService petService)
        {
            _petService = petService;
        }

        // GET /api/pets/mine
        [HttpGet("mine")]
        [Authorize(Roles = "Owner,Shelter,Admin")]
        public async Task<IActionResult> GetMyPetPosts()
        {
            try
            {
                var ownerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var petPosts = await _petService.GetMyPetPostsAsync(ownerId);

                if (petPosts == null || petPosts.Count == 0)
                    return NotFound(new { success = false, message = "No pet posts found" });

                return Ok(new { success = true, count = petPosts.Count, data = petPosts });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/pets
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailablePetPosts()
        {
            try
            {
                var petPosts = await _petService.GetAvailablePetPostsAsync();

                if (petPosts == null || petPosts.Count == 0)
                    return NotFound(new { success = false, message = "No available pet posts found" });

                return Ok(new { success = true, count = petPosts.Count, data = petPosts });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/pets/search?type=dog&breed=husky&age=2&location=cairo
        // (Must be registered before {id} so "search" is not parsed as an id.)
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchPetPosts([FromQuery] PetSearchDto filter)
        {
            try
            {
                var petPosts = await _petService.SearchPetPostsAsync(filter);

                if (petPosts == null || petPosts.Count == 0)
                    return NotFound(new { success = false, message = "No pets found matching your search" });

                return Ok(new { success = true, count = petPosts.Count, data = petPosts });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET /api/pets/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPetPostById(int id)
        {
            try
            {
                var petPost = await _petService.GetPetPostByIdAsync(id);

                if (petPost == null)
                    return NotFound(new { success = false, message = "Pet post not found" });

                return Ok(new { success = true, data = petPost });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST /api/pets
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize(Roles = "Owner,Shelter,Admin")]
        public async Task<IActionResult> CreatePet([FromForm] CreatePetDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ownerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                var (pet, petPostId) = await _petService.CreatePetAsync(dto, ownerId);

                if (pet == null)
                    return StatusCode(500, new { success = false, message = "Failed to create pet" });

                return CreatedAtAction(nameof(GetPetPostById), new { id = petPostId }, new
                {
                    success = true,
                    petPostId,
                    petId = pet.Id,
                    pet.Name,
                    pet.Breed,
                    pet.Age,
                    pet.Location,
                    pet.Type,
                    pet.Status,
                    pet.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // PUT /api/pets/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Shelter,Admin")]
        public async Task<IActionResult> UpdatePetPost(int id, [FromBody] UpdatePetDto? dto)
        {
            if (dto is null)
                return BadRequest(new { success = false, message = "Request body is required." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ownerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var (success, message, data) = await _petService.UpdatePetPostAsync(id, dto, ownerId);

            if (!success)
            {
                if (string.Equals(message, PetService.NoPatchFieldsMessage, StringComparison.Ordinal))
                    return BadRequest(new { success, message });
                return NotFound(new { success, message });
            }

            return Ok(new { success, message, data });
        }

        // DELETE /api/pets/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner,Shelter,Admin")]
        public async Task<IActionResult> DeletePet(int id)
        {
            var ownerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                var (success, message) = await _petService.DeletePetAsync(id, ownerId);

                if (!success)
                    return NotFound(new { success, message });

                return Ok(new { success, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}