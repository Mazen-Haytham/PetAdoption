// IPetRepository.cs
using backend.Models;

using Microsoft.EntityFrameworkCore.Storage;
namespace backend.Pets.Repositories
{
    public interface IPetRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<List<PetPost>> GetAvailablePetPostsAsync();
        Task<Pet> CreatePetAsync(Pet pet);
        Task<PetPost> CreatePetPostAsync(PetPost petPost);
        Task AddPetImagesAsync(List<PetImage> images);
        Task CreateApprovalRequestAsync(PostApprovalRequest approvalRequest);

        Task<PetPost?> GetPetPostByIdAsync(int id);
        Task UpdatePetPostAsync(PetPost petPost);
        
        Task DeletePetPostAsync(PetPost petPost);
        Task DeletePetAsync(Pet pet);
        Task SaveChangesAsync();
    }
}