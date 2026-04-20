// Services/PetService.cs  ← add UpdatePetAsync
using backend.Data;
using backend.Models;
using backend.Pets.DTOs;
using backend.Pets.Repositories;

namespace backend.Pets.Services
{
    public class PetService : IPetService
    {
        private readonly IPetRepository _petRepository;
        private readonly IWebHostEnvironment _env;

        public PetService(IPetRepository petRepository, IWebHostEnvironment env)
        {
            _petRepository = petRepository;
            _env = env;
        }

        public async Task<List<PetPostResponseDto>> GetAvailablePetPostsAsync()
        {
            var petPosts = await _petRepository.GetAvailablePetPostsAsync();

            return petPosts.Select(pp => new PetPostResponseDto
            {
                // ── PetPost Info ───────────────────────────
                PetPostId = pp.Id,
                Description = pp.Description ?? string.Empty,
                HealthStatus = pp.HealthStatus ?? string.Empty,
                Status = pp.Status.ToString(),
                CreatedAt = pp.CreatedAt,

                // ── Pet Info ───────────────────────────────
                PetId = pp.Pet.Id,
                Name = pp.Pet.Name,
                Type = pp.Pet.Type,
                Breed = pp.Pet.Breed,
                Location = pp.Pet.Location,
                Age = pp.Pet.Age,

                // ── Owner Info ─────────────────────────────
                OwnerId = pp.Owner.Id,
                OwnerName = pp.Owner.Name,

                // ── Images ─────────────────────────────────
                Images = pp.Images.Select(img => img.ImageUrl).ToList(),
                PrimaryImage = pp.Images.FirstOrDefault(img => img.IsPrimary)?.ImageUrl
            }).ToList();
        }
        public async Task<Pet> CreatePetAsync(CreatePetDto dto, int ownerId)
        {
            // ── Start Transaction ───────────────────────
            using var transaction = await _petRepository.BeginTransactionAsync();

            // keep track of saved image paths for cleanup if something fails
            var savedImagePaths = new List<string>();

            try
            {
                // ── 1. Create & save Pet ────────────────────
                var pet = new Pet
                {
                    Name = dto.Name,
                    Age = dto.Age,
                    Breed = dto.Breed,
                    Location = dto.Location,
                    Type = dto.Type,
                    OwnerId = ownerId,
                    Status = PetStatus.Available,
                    CreatedAt = DateTime.UtcNow
                };

                await _petRepository.CreatePetAsync(pet);
                await _petRepository.SaveChangesAsync();

                // ── 2. Create & save PetPost ────────────────
                var petPost = new PetPost
                {
                    PetId = pet.Id,
                    OwnerId = ownerId,
                    Description = dto.Description,
                    HealthStatus = dto.HealthStatus,
                    Status = PetStatus.Available,
                    CreatedAt = DateTime.UtcNow
                };

                await _petRepository.CreatePetPostAsync(petPost);
                await _petRepository.SaveChangesAsync();
                var approvalRequest = new PostApprovalRequest
                {
                    PetPostId = petPost.Id,
                    OwnerId = ownerId,
                    Status = PostApprovalStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                await _petRepository.CreateApprovalRequestAsync(approvalRequest);
                await _petRepository.SaveChangesAsync();

                // ── 3. Save Images linked to PetPost ────────
                if (dto.Images == null || dto.Images.Count == 0)
                    throw new Exception("At least one image is required");

                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "pets");
                Directory.CreateDirectory(uploadsFolder);

                var petImages = new List<PetImage>();
                bool isFirst = true;

                foreach (var image in dto.Images)
                {
                    if (image.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        // track saved files in case we need to delete them on failure
                        savedImagePaths.Add(filePath);

                        petImages.Add(new PetImage
                        {
                            PetPostId = petPost.Id,
                            ImageUrl = $"/uploads/pets/{fileName}",
                            IsPrimary = isFirst,
                            UploadedAt = DateTime.UtcNow
                        });

                        isFirst = false;
                    }
                }

                await _petRepository.AddPetImagesAsync(petImages);
                await _petRepository.SaveChangesAsync();

                // ── Commit Transaction ──────────────────────
                await transaction.CommitAsync();

                return pet;
            }
            catch (Exception)
            {
                // ── Rollback DB ─────────────────────────────
                await transaction.RollbackAsync();

                // ── Delete saved image files ─────────────────
                // (DB rolled back but files were already saved to disk)
                foreach (var path in savedImagePaths)
                {
                    if (File.Exists(path))
                        File.Delete(path);
                }

                throw;
            }
        }

        public async Task<(bool Success, string Message, object? Data)> UpdatePetPostAsync(int petPostId, UpdatePetDto dto, int ownerId)
        {
            // ── 1. Find PetPost ─────────────────────────
            var petPost = await _petRepository.GetPetPostByIdAsync(petPostId);

            if (petPost == null)
                return (false, "Pet post not found", null);

            // ── 2. Check ownership ──────────────────────
            if (petPost.OwnerId != ownerId)
                return (false, "You are not allowed to update this post", null);

            // ── 3. Update PetPost fields ────────────────
            if (dto.HealthStatus != null) petPost.HealthStatus = dto.HealthStatus;
            if (dto.Description != null) petPost.Description = dto.Description;

            // ── 4. Update Pet fields via navigation ─────
            if (dto.Name != null) petPost.Pet.Name = dto.Name;
            if (dto.Age != null) petPost.Pet.Age = dto.Age.Value;
            if (dto.Breed != null) petPost.Pet.Breed = dto.Breed;
            if (dto.Location != null) petPost.Pet.Location = dto.Location;

            await _petRepository.UpdatePetPostAsync(petPost);
            await _petRepository.SaveChangesAsync();

            return (true, "Pet updated successfully", new
            {
                id = petPost.Pet.Id,
                name = petPost.Pet.Name
            });
        }
        public async Task<(bool Success, string Message)> DeletePetAsync(int petPostId, int ownerId)
        {
            using var transaction = await _petRepository.BeginTransactionAsync();

            try
            {
                // ── 1. Find PetPost with Pet and Images ─────
                var petPost = await _petRepository.GetPetPostByIdAsync(petPostId);

                if (petPost == null)
                    return (false, "Pet post not found");

                // ── 2. Check ownership ──────────────────────
                if (petPost.OwnerId != ownerId)
                    return (false, "You are not allowed to delete this post");

                // ── 3. Collect image paths before deletion ──
                var imagePaths = petPost.Images
                    .Select(img => Path.Combine(_env.WebRootPath, img.ImageUrl.TrimStart('/')))
                    .ToList();

                // ── 4. Delete PetPost (cascade deletes images from DB) ──
                await _petRepository.DeletePetPostAsync(petPost);
                await _petRepository.SaveChangesAsync();

                // ── 5. Delete Pet ───────────────────────────
                await _petRepository.DeletePetAsync(petPost.Pet);
                await _petRepository.SaveChangesAsync();

                // ── 6. Commit Transaction ───────────────────
                await transaction.CommitAsync();

                // ── 7. Delete image files from disk ─────────
                // (done after commit so DB is safe first)
                foreach (var path in imagePaths)
                {
                    if (File.Exists(path))
                        File.Delete(path);
                }

                return (true, "Pet deleted successfully");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}