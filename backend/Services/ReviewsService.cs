using backend.Data;
using backend.Models;
using backend.Reviews.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Reviews.Services
{
    public class ReviewsService : IReviewsService
    {
        private readonly AppDbContext _db;

        public ReviewsService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<(bool Success, string Message)> AddReviewAsync(int adopterId, CreateReviewDto dto)
        {
            // Verify the adoption exists and belongs to this adopter
            var adoption = await _db.Adoptions
                .FirstOrDefaultAsync(a => a.Id == dto.AdoptionId && a.AdopterId == adopterId);

            if (adoption is null)
                return (false, "Adoption not found or you are not the adopter.");

            // Only allow review after adoption is completed
            if (adoption.Status != AdoptionStatus.Completed)
                return (false, "You can only review after the adoption is completed.");

            // Check if review already exists for this adoption
            var alreadyReviewed = await _db.Reviews
                .AnyAsync(r => r.AdoptionId == dto.AdoptionId && r.AdopterId == adopterId);

            if (alreadyReviewed)
                return (false, "You have already reviewed this adoption.");

            var review = new Review
            {
                AdoptionId = dto.AdoptionId,
                AdopterId = adopterId,
                OwnerId = adoption.OwnerId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();

            return (true, "Review added successfully.");
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByOwnerIdAsync(int ownerId)
        {
            var reviews = await _db.Reviews
                .Where(r => r.OwnerId == ownerId)
                .Include(r => r.Adopter)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDto
                {
                    Id = r.ReviewId,
                    ReviewerName = r.Adopter.Name,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    Date = r.CreatedAt
                })
                .ToListAsync();

            return reviews;
        }
    }
}
