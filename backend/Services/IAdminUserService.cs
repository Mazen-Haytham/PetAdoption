using backend.Dto.Admin;

namespace backend.Services
{
    public interface IAdminUserService
    {
        Task<List<AdminUserResponseDto>> GetUsersAsync(string? role, string? status);
        Task<AdminUserResponseDto?> GetUserByIdAsync(int id);
        Task<bool> ApproveUserAsync(int id);
        Task<bool> RejectUserAsync(int id);
        Task<List<AdminUserResponseDto>> GetAllUsersAsync();



    }
}