using backend.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Requests.Repositories
{
    public interface IRequestRepository
    {
        Task<List<Request>> GetRequestsByOwnerIdAsync(int ownerId);
        Task<List<Request>> GetRequestsByAdopterIdAsync(int adopterId);
        Task<Request?> GetRequestByIdAsync(int requestId);
        Task<PetPost?> GetPetPostByIdAsync(int petPostId);
        Task<bool> AdopterHasPendingRequestForPetPostAsync(int adopterId, int petPostId);
        /// <summary>True if this adopter has ever submitted a request on any of the owner&apos;s pet posts.</summary>
        Task<bool> OwnerHasOrHadRequestFromAdopterAsync(int ownerId, int adopterId);
        Task CreateRequestAsync(Request request);
        Task RejectOtherPendingRequestsForPetPostAsync(int petPostId, int exceptRequestId);
        Task<List<Adoption>> GetAdoptionsByAdopterIdAsync(int adopterId);
        Task CreateAdoptionAsync(Adoption adoption);
        Task SaveChangesAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<Adoption?> GetAdoptionByPetPostIdAsync(int petPostId);
    }
}