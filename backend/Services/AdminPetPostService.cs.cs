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
        private readonly IDistributedCache _redis;  
        private readonly IMemoryCache _memory;      

        // Same key as PetService — must match exactly
        private const string AllPetPostsCacheKey = "petPosts:all";

        public AdminPetPostService(
            IAdminPetPostRepository repo,
            AppDbContext context,
            IDistributedCache redis,  
            IMemoryCache memory)       
        {
            _repo = repo;
            _context = context;
            _redis = redis;            
            _memory = memory;          
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

            
            await _redis.RemoveAsync(AllPetPostsCacheKey);
            _memory.Remove(AllPetPostsCacheKey);

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

            
            await _redis.RemoveAsync(AllPetPostsCacheKey);
            _memory.Remove(AllPetPostsCacheKey);

            return true;
        }
    }
}