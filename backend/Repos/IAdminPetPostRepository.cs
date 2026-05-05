using backend.Dto.AdminPetPost;

namespace backend.Repos
{
    public interface IAdminPetPostRepository
    {
        Task<List<AdminPetPostDto>> GetPetsAsync(string? status, int page, int pageSize);
    }
}