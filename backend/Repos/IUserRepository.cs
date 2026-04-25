using backend.Data;
using backend.Models;

namespace backend.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetUsersAsync(UserRole? role, AccountStatus? status);
        Task<User?> GetByIdAsync(int id);
        Task<bool> UpdateUserStatusAsync(int id, AccountStatus status);
        Task<bool> DeleteUserAsync(int id);
    }
}