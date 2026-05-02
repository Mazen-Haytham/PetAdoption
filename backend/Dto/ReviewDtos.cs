using System.ComponentModel.DataAnnotations;

namespace backend.Reviews.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public int AdoptionId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }
    }

    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public string ReviewerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime Date { get; set; }
    }
}
