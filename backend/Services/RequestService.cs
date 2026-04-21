using backend.Data;
using backend.Models;
using backend.Requests.DTOs;
using backend.Requests.Repositories;

namespace backend.Requests.Services
{
    public class RequestService : IRequestService
    {
        private readonly IRequestRepository _requestRepository;

        public RequestService(IRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
        }

        public async Task<List<RequestResponseDto>> GetRequestsByOwnerIdAsync(int ownerId)
        {
            var requests = await _requestRepository.GetRequestsByOwnerIdAsync(ownerId);

            return requests.Select(r => new RequestResponseDto
            {
                RequestId = r.Id,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt,
                AdopterId = r.AdopterId,
                AdopterName = r.Adopter.Name,
                PetPostId = r.PetPostId,
                PetName = r.PetPost.Pet.Name,
                PetBreed = r.PetPost.Pet.Breed,
                PrimaryImage = r.PetPost.Images
                                .FirstOrDefault(img => img.IsPrimary)?.ImageUrl
            }).ToList();
        }

        public async Task<(bool Success, string Message)> AcceptRequestAsync(int requestId, int ownerId)
        {
            using var transaction = await _requestRepository.BeginTransactionAsync();

            try
            {
                // ── 1. Find Request ─────────────────────
                var request = await _requestRepository.GetRequestByIdAsync(requestId);

                if (request == null)
                    return (false, "Request not found");

                // ── 2. Check ownership ──────────────────
                if (request.PetPost.OwnerId != ownerId)
                    return (false, "You are not allowed to accept this request");

                // ── 3. Check if already processed ───────
                if (request.Status != RequestStatus.Pending)
                    return (false, $"Request is already {request.Status}");

                // ── 4. Accept Request ───────────────────
                request.Status = RequestStatus.Accepted;

                // ── 5. Create Adoption ──────────────────
                var adoption = new Adoption
                {
                    RequestId = request.Id,
                    AdopterId = request.AdopterId,
                    OwnerId = ownerId,
                    PetPostId = request.PetPostId,
                    Status = AdoptionStatus.Completed,
                    AdoptedAt = DateTime.UtcNow
                };

                await _requestRepository.CreateAdoptionAsync(adoption);

                // ── 6. Update PetPost Status ────────────
                request.PetPost.Status = PetStatus.Adopted;

                await _requestRepository.SaveChangesAsync();
                await transaction.CommitAsync();

                return (true, "Request accepted and adoption created successfully");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<(bool Success, string Message)> RejectRequestAsync(int requestId, int ownerId)
        {
            var request = await _requestRepository.GetRequestByIdAsync(requestId);

            if (request == null)
                return (false, "Request not found");

            // ── Check ownership ─────────────────────────
            if (request.PetPost.OwnerId != ownerId)
                return (false, "You are not allowed to reject this request");

            // ── Check if already processed ───────────────
            if (request.Status != RequestStatus.Pending)
                return (false, $"Request is already {request.Status}");

            // ── Reject ───────────────────────────────────
            request.Status = RequestStatus.Rejected;

            await _requestRepository.SaveChangesAsync();

            return (true, "Request rejected successfully");
        }
    }
}