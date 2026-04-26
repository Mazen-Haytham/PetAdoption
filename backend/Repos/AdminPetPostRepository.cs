using backend.Data;
using backend.Dto.AdminPetPost;
using Microsoft.EntityFrameworkCore;

namespace backend.Repos
{
    public class AdminPetPostRepository : IAdminPetPostRepository
    {
        private readonly AppDbContext _context;

        public AdminPetPostRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminPetPostDto>> GetPetsAsync(string? status, int page, int pageSize)
        {
            var query = _context.PostApprovalRequests
                .Include(x => x.PetPost)
                    .ThenInclude(p => p.Pet)
                .Include(x => x.Owner)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) &&
              Enum.TryParse<PostApprovalStatus>(status, true, out var parsedStatus))
            {
                query = query.Where(x => x.Status == parsedStatus);
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AdminPetPostDto
                {
                    Id = x.PetPost.Id,
                    Name = x.PetPost.Pet.Name,
                    Owner = x.Owner.Name,
                    Status = x.Status.ToString()
                })
                .ToListAsync();
        }
    }
}