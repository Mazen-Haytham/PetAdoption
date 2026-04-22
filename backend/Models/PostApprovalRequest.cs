// PostApprovalRequest.cs
using backend.Data;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class PostApprovalRequest
    {
        [Key]
        public int Id { get; set; }

        // ── FK → PetPost (the post waiting for approval) ──
        [Required]
        public int PetPostId { get; set; }

        [ForeignKey(nameof(PetPostId))]
        public PetPost PetPost { get; set; } = null!;

        // ── FK → User (Owner/Shelter who submitted the post) ──
        [Required]
        public int OwnerId { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public User Owner { get; set; } = null!;

        // ── FK → User (Admin who reviews it) ──────────
        public int? ReviewedByAdminId { get; set; }   // nullable until admin acts

        [ForeignKey(nameof(ReviewedByAdminId))]
        public User? ReviewedByAdmin { get; set; }

        // ── Status ─────────────────────────────────────
        public PostApprovalStatus Status { get; set; } = PostApprovalStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }     // nullable until admin acts

        public string? RejectionReason { get; set; }  // admin explains why if rejected
    }
}