using backend.Data;
using backend.Models;
using backend.Repos;

namespace backend.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<List<User>> GetUsersAsync(UserRole? role, AccountStatus? status);
        //Task<User?> GetByIdAsync(int id);
        //Task<bool> UpdateUserStatusAsync(int id, AccountStatus status);
       
    }
}