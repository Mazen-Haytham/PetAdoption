using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Requests.Repositories
{
    public class RequestRepository : IRequestRepository
    {
        private readonly AppDbContext _context;

        public RequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Request>> GetRequestsByOwnerIdAsync(int ownerId)
        {
            return await _context.AdoptionRequests
                .Where(r => r.PetPost.OwnerId == ownerId)
                .Include(r => r.Adopter)
                .Include(r => r.PetPost)
                    .ThenInclude(pp => pp.Pet)
                .Include(r => r.PetPost)
                    .ThenInclude(pp => pp.Images)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Request?> GetRequestByIdAsync(int requestId)
        {
            return await _context.AdoptionRequests
                .Include(r => r.Adopter)
                .Include(r => r.PetPost)
                    .ThenInclude(pp => pp.Pet)
                .FirstOrDefaultAsync(r => r.Id == requestId);
        }

        public async Task CreateAdoptionAsync(Adoption adoption)
        {
            await _context.Adoptions.AddAsync(adoption);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
    }
}