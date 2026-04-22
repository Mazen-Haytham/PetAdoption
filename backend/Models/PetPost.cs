using backend.Data;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class PetPost
    {
        [Key]
        public int Id { get; set; }

        // ── FK → Pet ───────────────────────────────────
        [Required]
        public int PetId { get; set; }

        [ForeignKey(nameof(PetId))]
        public Pet Pet { get; set; } = null!;

        // ── FK → User (Owner who is posting) ──────────
        [Required]
        public int OwnerId { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public User Owner { get; set; } = null!;

        // ── Post Metadata ──────────────────────────────
        public required string Description { get; set; }
        
        public required string HealthStatus { get; set; }

        public PetStatus Status { get; set; } = PetStatus.Available;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public PostApprovalRequest? PostApprovalRequest { get; set; }
        public ICollection<PetImage> Images { get; set; } = new List<PetImage>();
        public ICollection<UserFavourite> UserFavourite { get; set; } = new List<UserFavourite>();
        public Adoption? Adoptions { get; set; }
        public ICollection<Request> Requests { get; set; } = new List<Request>();

    }
}