using backend.Data;
using backend.Dto;
using backend.Hubs;
using backend.Models;
using backend.Pets.DTOs;
using backend.Pets.Mapping;
using backend.Pets.Repositories;
using Microsoft.AspNetCore.SignalR;
using backend.Services;

namespace backend.Pets.Services
{
    public class PetService : IPetService
    {
        private readonly IPetRepository _petRepository;
        private readonly IWebHostEnvironment _env;
        private readonly ICachingService _cachingService;
        private readonly IHubContext<NotificationsHub> _hubContext;

        // ── Cache keys ──────────────────────────────
        private const string AllPetPostsCacheKey = "petPosts:all";
        private static string SinglePetPostCacheKey(int id) => $"petPosts:{id}";
        private static string OwnerPetPostsCacheKey(int ownerId) => $"petPosts:owner:{ownerId}";

        public PetService(
            IPetRepository petRepository,
            IWebHostEnvironment env,
            ICachingService cachingService,
            IHubContext<NotificationsHub> hubContext)
        {
            _petRepository = petRepository;
            _env = env;
            _cachingService = cachingService;
            _hubContext = hubContext;
        }

        // ── GET ALL ─────────────────────────────────
        public async Task<List<PetPostResponseDto>> GetAvailablePetPostsAsync()
        {
            return await _cachingService.GetOrSetCacheAsync(
                AllPetPostsCacheKey,
                async () =>
                {
                    var petPosts = await _petRepository.GetAvailablePetPostsAsync();
                    return petPosts.Select(pp => MapToDto(pp)).ToList();
                });
        }

        // ── GET BY ID ───────────────────────────────
        public async Task<PetPostResponseDto?> GetPetPostByIdAsync(int petPostId)
        {
            return await _cachingService.GetOrSetCacheAsync(
                SinglePetPostCacheKey(petPostId),
                async () =>
                {
                    var petPost = await _petRepository.GetPetPostWithDetailsAsync(petPostId);
                    return petPost == null ? null : MapToDto(petPost);
                });
        }

        // ── GET BY ID (Detail DTO) ──────────────────
        public async Task<PetPostDetailDto?> GetPetPostByIdDTOAsync(int petPostId)
        {
            return await _cachingService.GetOrSetCacheAsync(
                $"petPosts:detail:{petPostId}",
                async () =>
                {
                    var post = await _petRepository.GetPetPostByIdAsync(petPostId);

                    if (post is null) return null;

                    return new PetPostDetailDto
                    {
                        Id = post.Id,
                        Name = post.Pet.Name,
                        Age = post.Pet.Age,
                        Breed = post.Pet.Breed,
                        Type = post.Pet.Type,
                        HealthStatus = post.HealthStatus,
                        Description = post.Description,
                        Location = post.Pet.Location,
                        Status = post.Status.ToString(),
                        Images = post.Images
                                           .OrderByDescending(img => img.IsPrimary)
                                           .Select(img => img.ImageUrl)
                                           .ToList(),
                        Owner = new OwnerSummaryDto
                        {
                            Id = post.Owner.Id,
                            Name = post.Owner.Name
                        },
                        CreatedAt = post.CreatedAt
                    };
                });
        }

        // ── GET MY POSTS ────────────────────────────
        public async Task<List<PetPostResponseDto>> GetMyPetPostsAsync(int ownerId)
        {
            return await _cachingService.GetOrSetCacheAsync(
                OwnerPetPostsCacheKey(ownerId),
                async () =>
                {
                    var posts = await _petRepository.GetPetPostsByOwnerIdAsync(ownerId);
                    return posts.Select(pp => MapToDto(pp)).ToList();
                });
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
                    Gender = dto.Gender,
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
                    Status = PetStatus.Pending,
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

                // ── Invalidate cache ─────────────────────────
                await _cachingService.InvalidatePetCacheAsync(petPost.Id, ownerId);

                // ── Notify Admins ────────────────────────────
                await _hubContext.Clients.Group("Admins").SendAsync("NewPostCreated", new NotificationDto
                {
                    Message = "New pet post waiting for approval",
                    PostId = petPost.Id,
                    OwnerId = ownerId,
                    CreatedAt = DateTime.UtcNow
                });



                return pet;  // ← no cache invalidation
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

            // ── Invalidate cache ─────────────────────────
            await _cachingService.InvalidatePetCacheAsync(petPostId, ownerId);

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

                // ── Invalidate cache ─────────────────────────
                await _cachingService.InvalidatePetCacheAsync(petPostId, ownerId);

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

        // ── Mapping helper ───────────────────────────
        private static PetPostResponseDto MapToDto(PetPost pp) => PetPostResponseMapper.Map(pp)!;
    }
}