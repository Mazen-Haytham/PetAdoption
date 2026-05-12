// PetRepository.cs
using backend.Data;
using backend.Models;
using backend.Pets.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
namespace backend.Pets.Repositories
{
    public static class PetListingPatchMessages
    {
        public const string NoPatchFields = "No updatable fields were provided.";
    }

    public class PetRepository : IPetRepository
    {
        private readonly AppDbContext _context;

        public PetRepository(AppDbContext context)
        {
            _context = context;
        }
        // PetRepository.cs
        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
        public async Task<List<PetPost>> GetAvailablePetPostsAsync()
        {
            return await _context.PetPosts
                .Where(pp => pp.Status == PetStatus.Available
                          && pp.PostApprovalRequest != null
                          && pp.PostApprovalRequest.Status == PostApprovalStatus.Approved)
                .Include(pp => pp.Pet)
                .Include(pp => pp.Owner)
                .Include(pp => pp.Images)
                .Include(pp => pp.PostApprovalRequest)
                .OrderByDescending(pp => pp.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<PetPost>> GetPetPostsByOwnerIdAsync(int ownerId)
        {
            return await _context.PetPosts
                .Where(pp => pp.OwnerId == ownerId)
                .Include(pp => pp.Pet)
                .Include(pp => pp.Owner)
                .Include(pp => pp.Images)
                .Include(pp => pp.PostApprovalRequest)
                .OrderByDescending(pp => pp.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<PetPost>> SearchPetPostsAsync(PetSearchDto filter)
        {
            var query = _context.PetPosts
                .Where(pp => pp.Status == PetStatus.Available
                          && pp.PostApprovalRequest != null
                          && pp.PostApprovalRequest.Status == PostApprovalStatus.Approved)
                .Include(pp => pp.Pet)
                .Include(pp => pp.Owner)
                .Include(pp => pp.Images)
                .Include(pp => pp.PostApprovalRequest)
                .AsQueryable();

            // ── Apply filters only if provided ─────────
            if (!string.IsNullOrEmpty(filter.Type))
                query = query.Where(pp => pp.Pet.Type.ToLower()
                             .Contains(filter.Type.ToLower()));

            if (!string.IsNullOrEmpty(filter.Breed))
                query = query.Where(pp => pp.Pet.Breed.ToLower()
                             .Contains(filter.Breed.ToLower()));

            if (filter.Age.HasValue)
                query = query.Where(pp => pp.Pet.Age == filter.Age.Value);

            if (!string.IsNullOrEmpty(filter.Location))
                query = query.Where(pp => pp.Pet.Location.ToLower()
                             .Contains(filter.Location.ToLower()));

            return await query
                .OrderByDescending(pp => pp.CreatedAt)
                .ToListAsync();
        }
        public async Task<Pet> CreatePetAsync(Pet pet)
        {
            await _context.Pets.AddAsync(pet);
            return pet;
        }

        public async Task<PetPost> CreatePetPostAsync(PetPost petPost)
        {
            await _context.PetPosts.AddAsync(petPost);
            return petPost;
        }

        public async Task AddPetImagesAsync(List<PetImage> images)
        {
            await _context.PetImages.AddRangeAsync(images);
        }
        public async Task CreateApprovalRequestAsync(PostApprovalRequest approvalRequest)
        {
            await _context.PostApprovalRequests.AddAsync(approvalRequest);
        }
        public async Task<PetPost?> GetPetPostByIdAsync(int id)
        {
            return await _context.PetPosts
                .Include(pp => pp.Pet)
                .Include(pp => pp.Images)
                .Include(pp => pp.Adoptions)
                .FirstOrDefaultAsync(pp => pp.Id == id);
        }
        public async Task<PetPost?> GetPetPostWithDetailsAsync(int id)
        {
            return await _context.PetPosts
                .Include(pp => pp.Pet)
                .Include(pp => pp.Owner)
                .Include(pp => pp.Images)
                .Include(pp => pp.PostApprovalRequest)
                .FirstOrDefaultAsync(pp => pp.Id == id);
        }
        public async Task<(bool Success, string Message)> TryPatchPetPostAsync(
            int petPostId,
            int ownerId,
            UpdatePetDto dto)
        {
            var stub = await _context.PetPosts
                .AsNoTracking()
                .Where(pp => pp.Id == petPostId)
                .Select(pp => new { pp.OwnerId, pp.PetId })
                .FirstOrDefaultAsync();

            if (stub == null)
                return (false, "Pet post not found");

            if (stub.OwnerId != ownerId)
                return (false, "You are not allowed to update this post");

            var touched = false;

            if (dto.Description != null)
            {
                await _context.PetPosts
                    .Where(pp => pp.Id == petPostId)
                    .ExecuteUpdateAsync(s => s.SetProperty(pp => pp.Description, dto.Description));
                touched = true;
            }

            if (dto.HealthStatus != null)
            {
                await _context.PetPosts
                    .Where(pp => pp.Id == petPostId)
                    .ExecuteUpdateAsync(s => s.SetProperty(pp => pp.HealthStatus, dto.HealthStatus));
                touched = true;
            }

            if (dto.Name != null)
            {
                await _context.Pets
                    .Where(p => p.Id == stub.PetId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Name, dto.Name));
                touched = true;
            }

            if (dto.Age.HasValue)
            {
                await _context.Pets
                    .Where(p => p.Id == stub.PetId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Age, dto.Age.Value));
                touched = true;
            }

            if (dto.Breed != null)
            {
                await _context.Pets
                    .Where(p => p.Id == stub.PetId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Breed, dto.Breed));
                touched = true;
            }

            if (dto.Location != null)
            {
                await _context.Pets
                    .Where(p => p.Id == stub.PetId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Location, dto.Location));
                touched = true;
            }

            if (dto.Type != null)
            {
                await _context.Pets
                    .Where(p => p.Id == stub.PetId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Type, dto.Type));
                touched = true;
            }

            if (dto.Gender != null)
            {
                await _context.Pets
                    .Where(p => p.Id == stub.PetId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Gender, dto.Gender));
                touched = true;
            }

            if (!touched)
                return (false, PetListingPatchMessages.NoPatchFields);

            return (true, "Pet updated successfully");
        }
        public async Task DeletePetPostAsync(PetPost petPost)
        {
            _context.PetPosts.Remove(petPost);
        }

        public async Task DeletePetAsync(Pet pet)
        {
            _context.Pets.Remove(pet);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}