// ── Review.cs ──────────────────────────────────────────────────────────────
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class Review
    {
        [Key]
        public int ReviewId { get; set; }

        // ── FK → Adoption (review only after a completed adoption) ─
        [Required]
        public int AdoptionId { get; set; }

        [ForeignKey(nameof(AdoptionId))]
        public Adoption Adoption { get; set; } = null!;

        // ── FK → User (Adopter writing the review) ────
        [Required]
        public int AdopterId { get; set; }

        [ForeignKey(nameof(AdopterId))]
        public User Adopter { get; set; } = null!;

        // ── FK → User (Owner/Shelter being reviewed) ──
        [Required]
        public int OwnerId { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public User Owner { get; set; } = null!;

        // ── Review Content ─────────────────────────────
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}