using backend.Data;
using backend.Dto.AdminPetPost;
using backend.Models;
using backend.Repos;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AdminPetPostService : IAdminPetPostService
    {
        private readonly IAdminPetPostRepository _repo;
        private readonly AppDbContext _context;
        private readonly ICachingService _cachingService;

        public AdminPetPostService(
            IAdminPetPostRepository repo,
            AppDbContext context,
            ICachingService cachingService)
        {
            _repo = repo;
            _context = context;
            _cachingService = cachingService;
        }

        public async Task<List<AdminPetPostDto>> GetPetsAsync(string? status, int page, int pageSize)
        {
            return await _repo.GetPetsAsync(status, page, pageSize);
        }

        /// <summary>Route id is usually approval request id; otherwise a pending row is resolved by <see cref="PetPost.Id"/>.</summary>
        private async Task<PostApprovalRequest?> LoadModerationRequestAsync(int routeId)
        {
            var request = await _context.PostApprovalRequests
                .Include(x => x.PetPost)
                .FirstOrDefaultAsync(x => x.Id == routeId);

            if (request != null)
                return request;

            return await _context.PostApprovalRequests
                .Include(x => x.PetPost)
                .FirstOrDefaultAsync(x => x.PetPostId == routeId && x.Status == PostApprovalStatus.Pending);
        }

        public async Task<bool> ApprovePetAsync(int routeId, int adminId)
        {
            var outcome = await _context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                _context.ChangeTracker.Clear();

                var request = await LoadModerationRequestAsync(routeId);
                if (request is null || request.Status != PostApprovalStatus.Pending)
                    return (ok: false, petPostId: 0, ownerId: 0);

                request.Status = PostApprovalStatus.Approved;
                request.ReviewedByAdminId = adminId;
                request.ReviewedAt = DateTime.UtcNow;

                var petPostId = request.PetPostId;
                var petId = request.PetPost.PetId;
                var ownerId = request.OwnerId;

                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    await _context.SaveChangesAsync();

                    await _context.PetPosts
                        .Where(p => p.Id == petPostId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Status, PetStatus.Available));

                    await _context.Pets
                        .Where(p => p.Id == petId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Status, PetStatus.Available));

                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }

                return (ok: true, petPostId, ownerId);
            });

            if (!outcome.ok)
                return false;

            await _cachingService.InvalidatePetCacheAsync(outcome.petPostId, outcome.ownerId);
            return true;
        }

        public async Task<bool> RejectPetAsync(int routeId, int adminId)
        {
            var outcome = await _context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
            {
                _context.ChangeTracker.Clear();

                var request = await LoadModerationRequestAsync(routeId);
                if (request is null || request.Status != PostApprovalStatus.Pending)
                    return (ok: false, petPostId: 0, ownerId: 0);

                request.Status = PostApprovalStatus.Rejected;
                request.ReviewedByAdminId = adminId;
                request.ReviewedAt = DateTime.UtcNow;

                var petPostId = request.PetPostId;
                var petId = request.PetPost.PetId;
                var ownerId = request.OwnerId;

                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    await _context.SaveChangesAsync();

                    await _context.PetPosts
                        .Where(p => p.Id == petPostId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Status, PetStatus.Rejected));

                    await _context.Pets
                        .Where(p => p.Id == petId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Status, PetStatus.Rejected));

                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }

                return (ok: true, petPostId, ownerId);
            });

            if (!outcome.ok)
                return false;

            await _cachingService.InvalidatePetCacheAsync(outcome.petPostId, outcome.ownerId);
            return true;
        }
    }
}
