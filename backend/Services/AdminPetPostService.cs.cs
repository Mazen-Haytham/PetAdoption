using backend.Data;
using backend.Dto.AdminPetPost;
using backend.Models;
using backend.Repos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

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

        public async Task<bool> ApprovePetAsync(int approvalId, int adminId)
        {
            var request = await _context.PostApprovalRequests
                .Include(x => x.PetPost)
                .FirstOrDefaultAsync(x => x.Id == approvalId);

            if (request == null) return false;

            request.Status = PostApprovalStatus.Approved;
            request.ReviewedByAdminId = adminId;
            request.ReviewedAt = DateTime.UtcNow;
            request.PetPost.Status = PetStatus.Available;

            await _context.SaveChangesAsync();

            // ── Invalidate cache ─────────────────────────
            await _cachingService.InvalidatePetCacheAsync(request.PetPost.Id, request.PetPost.OwnerId);

            return true;
        }

        public async Task<bool> RejectPetAsync(int approvalId, int adminId)
        {
            var request = await _context.PostApprovalRequests
                .Include(x => x.PetPost)
                .FirstOrDefaultAsync(x => x.Id == approvalId);

            if (request == null) return false;

            request.Status = PostApprovalStatus.Rejected;
            request.ReviewedByAdminId = adminId;
            request.ReviewedAt = DateTime.UtcNow;
            request.PetPost.Status = PetStatus.Available;

            await _context.SaveChangesAsync();

            // ── Invalidate cache ─────────────────────────
            await _cachingService.InvalidatePetCacheAsync(request.PetPost.Id, request.PetPost.OwnerId);

            return true;
        }
    }
}