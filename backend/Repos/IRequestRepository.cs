using backend.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Requests.Repositories
{
    public interface IRequestRepository
    {
        Task<List<Request>> GetRequestsByOwnerIdAsync(int ownerId);
        Task<Request?> GetRequestByIdAsync(int requestId);
        Task CreateAdoptionAsync(Adoption adoption);
        Task SaveChangesAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}