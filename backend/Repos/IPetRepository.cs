// IPetRepository.cs
using backend.Models;
using backend.Pets.DTOs;
using Microsoft.EntityFrameworkCore.Storage;
namespace backend.Pets.Repositories
{
    public interface IPetRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<List<PetPost>> GetAvailablePetPostsAsync();
        Task<List<PetPost>> GetPetPostsByOwnerIdAsync(int ownerId);
        Task<Pet> CreatePetAsync(Pet pet);
        Task<PetPost> CreatePetPostAsync(PetPost petPost);
        Task AddPetImagesAsync(List<PetImage> images);
        Task CreateApprovalRequestAsync(PostApprovalRequest approvalRequest);

        Task<PetPost?> GetPetPostByIdAsync(int id);
        Task<PetPost?> GetPetPostWithDetailsAsync(int id);
        Task UpdatePetPostAsync(PetPost petPost);
        
        Task DeletePetPostAsync(PetPost petPost);
        Task DeletePetAsync(Pet pet);
        Task<List<PetPost>> SearchPetPostsAsync(PetSearchDto filter);
        Task SaveChangesAsync();
    }
}