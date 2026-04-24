using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class UserRepository(AppDbContext context) : IUserRepository
    {
        public async Task<List<User>> GetUsersAsync(UserRole? role, AccountStatus? status)
        {
            var query = context.Users.AsQueryable();

            if (role.HasValue)
                query = query.Where(u => u.Role == role.Value);

            if (status.HasValue)
                query = query.Where(u => u.Status == status.Value);

            return await query.ToListAsync();
        }
        public async Task<User?> GetByIdAsync(int id)
        {
            return await context.Users.FindAsync(id);
        }
        public async Task<bool> UpdateUserStatusAsync(int id, AccountStatus status)
        {
            var user = await context.Users.FindAsync(id);

            if (user == null)
                return false;

            user.Status = status;

            await context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await context.Users.FindAsync(id);

            if (user == null)
                return false;

            context.Users.Remove(user);

            await context.SaveChangesAsync();
            return true;
        }
    }
}