using backend.Requests.DTOs;

namespace backend.Requests.Services
{
    public interface IRequestService
    {
        Task<(bool Success, string Message, int? RequestId)> CreateAdoptionRequestAsync(int adopterId, int petPostId, string message);
        Task<List<RequestResponseDto>> GetRequestsByOwnerIdAsync(int ownerId);
        Task<List<object>> GetMyRequestsAsync(int adopterId);
        Task<List<object>> GetAdoptionHistoryAsync(int adopterId);
        Task<(bool Success, string Message)> AcceptRequestAsync(int requestId, int ownerId);
        Task<(bool Success, string Message)> RejectRequestAsync(int requestId, int ownerId);
    }
}