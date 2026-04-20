using backend.Pets.DTOs;
using backend.Pets.Services;
using Microsoft.AspNetCore.Mvc;

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
        // GET /api/petposts
        [HttpGet]
        public async Task<IActionResult> GetAvailablePetPosts()
        {
            try
            {
                var petPosts = await _petService.GetAvailablePetPostsAsync();

                return Ok(new
                {
                    success = true,
                    count = petPosts.Count,
                    data = petPosts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
        // POST /api/pets
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreatePet([FromForm] CreatePetDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: replace with JWT claim
            var ownerId = 1;

            try
            {
                var pet = await _petService.CreatePetAsync(dto, ownerId);

                return CreatedAtAction(nameof(CreatePet), new { id = pet.Id }, new
                {
                    pet.Id,
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
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message   // will show "At least one image is required" or any other error
                });
            }
        }
        // PUT /api/petposts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePetPost(int id, [FromBody] UpdatePetDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: replace with JWT claim
            var ownerId = 1;

            var (success, message, data) = await _petService.UpdatePetPostAsync(id, dto, ownerId);

            if (!success)
                return NotFound(new { success, message });

            return Ok(new { success, message, data });
        }
        // DELETE /api/petposts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePet(int id)
        {
            // TODO: replace with JWT claim
            var ownerId = 1;

            try
            {
                var (success, message) = await _petService.DeletePetAsync(id, ownerId);

                if (!success)
                    return NotFound(new { success, message });

                return Ok(new { success, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
