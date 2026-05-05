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

        public AdminPetPostService(IAdminPetPostRepository repo, AppDbContext context)
        {
            _repo = repo;
            _context = context;
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

            if (request == null)
                return false;

            request.Status = PostApprovalStatus.Approved;
            request.ReviewedByAdminId = adminId;
            request.ReviewedAt = DateTime.UtcNow;

            request.PetPost.Status = PetStatus.Available;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectPetAsync(int approvalId, int adminId)
        {
            var request = await _context.PostApprovalRequests
                .FirstOrDefaultAsync(x => x.Id == approvalId);

            if (request == null)
                return false;

            request.Status = PostApprovalStatus.Rejected;
            request.ReviewedByAdminId = adminId;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}