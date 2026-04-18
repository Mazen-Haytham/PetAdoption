using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Data;

namespace backend.Models
{
    public class Adoption
    {
        [Key]
        public int Id { get; set; }

        // ── FK → User (Adopter) ────────────────────────
        [Required]
        public int AdopterId { get; set; }

        [ForeignKey(nameof(AdopterId))]
        public User Adopter { get; set; } = null!;

        // ── FK → User (Owner) ──────────────────────────
        [Required]
        public int OwnerId { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public User Owner { get; set; } = null!;

        // ── FK → PetPost ───────────────────────────────
        [Required]
        public int PetPostId { get; set; }

        [ForeignKey(nameof(PetPostId))]
        public PetPost PetPost { get; set; } = null!;

        // ── FK → Request ───────────────────────────────
        [Required]
        public int RequestId { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;

        // ── Metadata ───────────────────────────────────
        public AdoptionStatus Status { get; set; } = AdoptionStatus.Pending;

        public DateTime AdoptedAt { get; set; } = DateTime.UtcNow;
    }
}