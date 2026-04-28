using backend.Data;
using backend.Models;
using backend.Pets.DTOs;
using backend.Pets.Repositories;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace backend.Pets.Services
{
    public class PetService : IPetService
    {
        private readonly IPetRepository _petRepository;
        private readonly IWebHostEnvironment _env;
        private readonly IDistributedCache _cache;

        // ── Cache keys ──────────────────────────────
        private const string AllPetPostsCacheKey = "petPosts:all";
        private static string SinglePetPostCacheKey(int id) => $"petPosts:{id}";

        public PetService(IPetRepository petRepository, IWebHostEnvironment env, IDistributedCache cache)
        {
            _petRepository = petRepository;
            _env = env;
            _cache = cache;
        }

        // ── GET ALL ─────────────────────────────────
        public async Task<List<PetPostResponseDto>> GetAvailablePetPostsAsync()
        {
            var cached = await _cache.GetStringAsync(AllPetPostsCacheKey);

            if (cached != null)
            {
                Console.WriteLine("CACHE HIT ");
                return JsonSerializer.Deserialize<List<PetPostResponseDto>>(cached)!;
            }

            var petPosts = await _petRepository.GetAvailablePetPostsAsync();

            var result = petPosts.Select(pp => MapToDto(pp)).ToList();

            await _cache.SetStringAsync(AllPetPostsCacheKey,
                JsonSerializer.Serialize(result),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
                });

            return result;
        }

        // ── GET BY ID ───────────────────────────────
        public async Task<PetPostResponseDto?> GetPetPostByIdAsync(int petPostId)
        {
            var cacheKey = SinglePetPostCacheKey(petPostId);
            var cached = await _cache.GetStringAsync(cacheKey);

            if (cached != null)
            {
                Console.WriteLine("CACHE HIT ");
                return JsonSerializer.Deserialize<PetPostResponseDto>(cached)!;
            }

            var petPost = await _petRepository.GetPetPostWithDetailsAsync(petPostId);

            if (petPost == null)
                return null;

            var result = MapToDto(petPost);

            await _cache.SetStringAsync(cacheKey,
                JsonSerializer.Serialize(result),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
                });

            return result;
        }

        // ── CREATE ──────────────────────────────────
        public async Task<Pet> CreatePetAsync(CreatePetDto dto, int ownerId)
        {
            using var transaction = await _petRepository.BeginTransactionAsync();
            var savedImagePaths = new List<string>();

            try
            {
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

                await transaction.CommitAsync();

                // ── Invalidate petPosts:all only ────────
                await _cache.RemoveAsync(AllPetPostsCacheKey);

                return pet;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                foreach (var path in savedImagePaths)
                    if (File.Exists(path)) File.Delete(path);

                throw;
            }
        }

        // ── UPDATE ──────────────────────────────────
        public async Task<(bool Success, string Message, object? Data)> UpdatePetPostAsync(int petPostId, UpdatePetDto dto, int ownerId)
        {
            var petPost = await _petRepository.GetPetPostByIdAsync(petPostId);

            if (petPost == null)
                return (false, "Pet post not found", null);

            if (petPost.OwnerId != ownerId)
                return (false, "You are not allowed to update this post", null);

            if (dto.HealthStatus != null) petPost.HealthStatus = dto.HealthStatus;
            if (dto.Description != null) petPost.Description = dto.Description;
            if (dto.Name != null) petPost.Pet.Name = dto.Name;
            if (dto.Age != null) petPost.Pet.Age = dto.Age.Value;
            if (dto.Breed != null) petPost.Pet.Breed = dto.Breed;
            if (dto.Location != null) petPost.Pet.Location = dto.Location;

            await _petRepository.UpdatePetPostAsync(petPost);
            await _petRepository.SaveChangesAsync();

            // ── Invalidate this post cache only ─────
            await _cache.RemoveAsync(SinglePetPostCacheKey(petPostId));

            return (true, "Pet updated successfully", new
            {
                id = petPost.Pet.Id,
                name = petPost.Pet.Name
            });
        }

        // ── DELETE ──────────────────────────────────
        public async Task<(bool Success, string Message)> DeletePetAsync(int petPostId, int ownerId)
        {
            using var transaction = await _petRepository.BeginTransactionAsync();

            try
            {
                var petPost = await _petRepository.GetPetPostByIdAsync(petPostId);

                if (petPost == null)
                    return (false, "Pet post not found");

                if (petPost.OwnerId != ownerId)
                    return (false, "You are not allowed to delete this post");

                var imagePaths = petPost.Images
                    .Select(img => Path.Combine(_env.WebRootPath, img.ImageUrl.TrimStart('/')))
                    .ToList();

                await _petRepository.DeletePetPostAsync(petPost);
                await _petRepository.SaveChangesAsync();

                await _petRepository.DeletePetAsync(petPost.Pet);
                await _petRepository.SaveChangesAsync();

                await transaction.CommitAsync();

                // ── Invalidate this post cache only ─────
                await _cache.RemoveAsync(SinglePetPostCacheKey(petPostId));

                foreach (var path in imagePaths)
                    if (File.Exists(path)) File.Delete(path);

                return (true, "Pet deleted successfully");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ── SEARCH ──────────────────────────────────
        public async Task<List<PetPostResponseDto>> SearchPetPostsAsync(PetSearchDto filter)
        {
            var petPosts = await _petRepository.SearchPetPostsAsync(filter);
            return petPosts.Select(pp => MapToDto(pp)).ToList();
        }

        // ── Shared mapping helper ───────────────────
        private static PetPostResponseDto MapToDto(PetPost pp) => new PetPostResponseDto
        {
            PetPostId = pp.Id,
            Description = pp.Description ?? string.Empty,
            HealthStatus = pp.HealthStatus ?? string.Empty,
            Status = pp.Status.ToString(),
            CreatedAt = pp.CreatedAt,
            PetId = pp.Pet.Id,
            Name = pp.Pet.Name,
            Type = pp.Pet.Type,
            Breed = pp.Pet.Breed,
            Location = pp.Pet.Location,
            Age = pp.Pet.Age,
            OwnerId = pp.Owner.Id,
            OwnerName = pp.Owner.Name,
            Images = pp.Images.Select(img => img.ImageUrl).ToList(),
            PrimaryImage = pp.Images.FirstOrDefault(img => img.IsPrimary)?.ImageUrl
        };
    }
}