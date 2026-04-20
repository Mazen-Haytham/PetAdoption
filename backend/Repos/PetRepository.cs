// PetRepository.cs
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
namespace backend.Pets.Repositories
{
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
                .FirstOrDefaultAsync(pp => pp.Id == id);
        }

        public async Task UpdatePetPostAsync(PetPost petPost)
        {
            _context.PetPosts.Update(petPost);
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