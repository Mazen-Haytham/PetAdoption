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

        public async Task<List<Request>> GetRequestsByAdopterIdAsync(int adopterId)
        {
            return await _context.AdoptionRequests
                .Where(r => r.AdopterId == adopterId)
                .Include(r => r.PetPost)
                    .ThenInclude(pp => pp.Pet)
                .Include(r => r.PetPost)
                    .ThenInclude(pp => pp.Images)
                .Include(r => r.PetPost)
                    .ThenInclude(pp => pp.Owner)
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

        public async Task<PetPost?> GetPetPostByIdAsync(int petPostId)
        {
            return await _context.PetPosts
                .Include(pp => pp.Pet)
                .Include(pp => pp.Owner)
                .FirstOrDefaultAsync(pp => pp.Id == petPostId);
        }

        public async Task<bool> AdopterHasPendingRequestForPetPostAsync(int adopterId, int petPostId)
        {
            return await _context.AdoptionRequests.AnyAsync(r =>
                r.AdopterId == adopterId &&
                r.PetPostId == petPostId &&
                r.Status == RequestStatus.Pending);
        }

        public async Task CreateRequestAsync(Request request)
        {
            await _context.AdoptionRequests.AddAsync(request);
        }

        public async Task RejectOtherPendingRequestsForPetPostAsync(int petPostId, int exceptRequestId)
        {
            var others = await _context.AdoptionRequests
                .Where(r =>
                    r.PetPostId == petPostId &&
                    r.Id != exceptRequestId &&
                    r.Status == RequestStatus.Pending)
                .ToListAsync();

            foreach (var r in others)
                r.Status = RequestStatus.Rejected;
        }

        public async Task<List<Adoption>> GetAdoptionsByAdopterIdAsync(int adopterId)
        {
            return await _context.Adoptions
                .Where(a => a.AdopterId == adopterId)
                .Include(a => a.PetPost)
                    .ThenInclude(pp => pp.Pet)
                .Include(a => a.PetPost)
                    .ThenInclude(pp => pp.Images)
                .Include(a => a.PetPost)
                    .ThenInclude(pp => pp.Owner)
                .OrderByDescending(a => a.AdoptedAt)
                .ToListAsync();
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