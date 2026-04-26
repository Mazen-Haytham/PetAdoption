using backend.Dto.AdminPetPost;

namespace backend.Services
{
    public interface IAdminPetPostService
    {
        Task<List<AdminPetPostDto>> GetPetsAsync(string? status, int page, int pageSize);
        Task<bool> ApprovePetAsync(int approvalId, int adminId);
        Task<bool> RejectPetAsync(int approvalId, int adminId);
    }
}