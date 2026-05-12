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
        /// <summary>Applies partial updates directly in the database (avoids change-tracker issues with Pet + PetPost).</summary>
        Task<(bool Success, string Message)> TryPatchPetPostAsync(int petPostId, int ownerId, UpdatePetDto dto);

        Task DeletePetPostAsync(PetPost petPost);
        Task DeletePetAsync(Pet pet);
        Task<List<PetPost>> SearchPetPostsAsync(PetSearchDto filter);
        Task SaveChangesAsync();
    }
}