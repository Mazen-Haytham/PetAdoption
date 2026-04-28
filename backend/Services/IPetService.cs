using backend.Pets.DTOs;
using backend.Models;

namespace backend.Pets.Services
{
    public interface IPetService
    {
        Task<List<PetPostResponseDto>> GetAvailablePetPostsAsync();
        Task<PetPostResponseDto?> GetPetPostByIdAsync(int petPostId);
        Task<Pet> CreatePetAsync(CreatePetDto dto, int ownerId);
        Task<(bool Success, string Message, object? Data)> UpdatePetPostAsync(int petPostId, UpdatePetDto dto, int ownerId);
        Task<(bool Success, string Message)> DeletePetAsync(int petPostId, int ownerId);
        Task<List<PetPostResponseDto>> SearchPetPostsAsync(PetSearchDto filter);
    }
}
