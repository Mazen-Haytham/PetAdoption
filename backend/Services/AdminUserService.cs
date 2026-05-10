using backend.Data;
using backend.Dto.Admin;
using backend.Models;
using backend.Repositories;

namespace backend.Services
{
    public class AdminUserService(IUserRepository userRepository) : IAdminUserService
    {
        public async Task<List<AdminUserResponseDto>> GetUsersAsync(string? role, string? status)
        {
            // 🔹 Convert role
            UserRole? roleEnum = null;
            if (!string.IsNullOrEmpty(role))
            {
                if (Enum.TryParse<UserRole>(role, true, out var parsedRole))
                    roleEnum = parsedRole;
                else
                    throw new Exception("Invalid role value");
            }

            // 🔹 Convert status
            AccountStatus? statusEnum = null;
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<AccountStatus>(status, true, out var parsedStatus))
                    statusEnum = parsedStatus;
                else
                    throw new Exception("Invalid status value");
            }

            var users = await userRepository.GetUsersAsync(roleEnum, statusEnum);

            // 🔹 Map to DTO
            return users.Select(u => new AdminUserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role.ToString(),
                Status = u.Status.ToString()
            }).ToList();

        }
        public async Task<AdminUserResponseDto?> GetUserByIdAsync(int id)
        {
            var user = await userRepository.GetByIdAsync(id);

            if (user == null)
                return null;

            return new AdminUserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                Status = user.Status.ToString()
            };
        }
        /* public async Task<bool> ApproveUserAsync(int id)
         {
             return await userRepository.UpdateUserStatusAsync(id, AccountStatus.Approved);
         }

         public async Task<bool> RejectUserAsync(int id)
         {
             return await userRepository.UpdateUserStatusAsync(id, AccountStatus.Rejected);
         }*/

        public async Task<bool> ApproveUserAsync(int id)
        {
            var user = await userRepository.GetByIdAsync(id);
            if (user == null) return false;
            user.Status = AccountStatus.Approved;
            userRepository.Update(user);
            return await userRepository.SaveChangesAsync();
        }

        public async Task<bool> RejectUserAsync(int id)
        {
            var user = await userRepository.GetByIdAsync(id);
            if (user == null) return false;
            user.Status = AccountStatus.Rejected;
            userRepository.Update(user);
            return await userRepository.SaveChangesAsync();
        }
        public async Task<List<AdminUserResponseDto>> GetAllUsersAsync()
        {
            var users = await userRepository.GetAllAsync(); // .

            return users.Select(u => new AdminUserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role.ToString(),
                Status = u.Status.ToString()
            }).ToList();
        }



    }
}