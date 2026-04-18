using backend.Data;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Request
    {
        [Key]
        public int Id { get; set; }

        // ── FK → PetPost ───────────────────────────────
        [Required]
        public int PetPostId { get; set; }

        [ForeignKey(nameof(PetPostId))]
        public PetPost PetPost { get; set; } = null!;

        // ── FK → User (Adopter sending the request) ────
        [Required]
        public int AdopterId { get; set; }

        [ForeignKey(nameof(AdopterId))]
        public User Adopter { get; set; } = null!;

        // ── Status ─────────────────────────────────────
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation ─────────────────────────────────
        public Adoption? Adoption { get; set; }   // set once owner approves
    }
}