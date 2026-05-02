using backend.Reviews.DTOs;

namespace backend.Reviews.Services
{
    public interface IReviewsService
    {
        Task<(bool Success, string Message)> AddReviewAsync(int adopterId, CreateReviewDto dto);
        Task<List<ReviewResponseDto>> GetReviewsByOwnerIdAsync(int ownerId);
    }
}
