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

        public async Task<(bool Success, string Message, int? RequestId)> CreateAdoptionRequestAsync(int adopterId, int petPostId, string message)
        {
            var petPost = await _requestRepository.GetPetPostByIdAsync(petPostId);
            if (petPost == null)
                return (false, "Pet post not found", null);

            if (petPost.OwnerId == adopterId)
                return (false, "You cannot create an adoption request for a pet you posted yourself", null);

            if (petPost.Status != PetStatus.Available)
                return (false, "This pet is not available for adoption", null);

            var alreadyPending = await _requestRepository.AdopterHasPendingRequestForPetPostAsync(adopterId, petPostId);
            if (alreadyPending)
                return (false, "You already have a pending request for this pet", null);

            var request = new Request
            {
                PetPostId = petPostId,
                AdopterId = adopterId,
                Message = message,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _requestRepository.CreateRequestAsync(request);
            await _requestRepository.SaveChangesAsync();

            return (true, "Adoption request sent successfully", request.Id);
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
                Message = r.Message,
                PrimaryImage = r.PetPost.Images
                                .FirstOrDefault(img => img.IsPrimary)?.ImageUrl
            }).ToList();
        }

        public async Task<List<object>> GetMyRequestsAsync(int adopterId)
        {
            var requests = await _requestRepository.GetRequestsByAdopterIdAsync(adopterId);

            return requests.Select(r => (object)new
            {
                id = r.Id,
                pet = new { id = r.PetPostId, name = r.PetPost.Pet.Name },
                status = r.Status.ToString().ToLowerInvariant(),
                createdAt = r.CreatedAt
            }).ToList();
        }

        public async Task<List<object>> GetAdoptionHistoryAsync(int adopterId)
        {
            var adoptions = await _requestRepository.GetAdoptionsByAdopterIdAsync(adopterId);

            return adoptions.Select(a => (object)new
            {
                pet = new { id = a.PetPostId, name = a.PetPost.Pet.Name },
                status = a.Status.ToString().ToLowerInvariant(),
                adoptedAt = a.AdoptedAt
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

                // ── 4.1 Reject other pending requests ────
                await _requestRepository.RejectOtherPendingRequestsForPetPostAsync(request.PetPostId, request.Id);

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

                return (true, "Adoption request approved");
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

            return (true, "Adoption request rejected");
        }
    }
}