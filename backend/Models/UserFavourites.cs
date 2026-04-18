using backend.Data;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class UserFavourite
    {
        [Key]
        public int Id { get; set; }

        // ── FK → User (Adopter) ────────────────────────
        [Required]
        public int AdopterId { get; set; }

        [ForeignKey(nameof(AdopterId))]
        public User Adopter { get; set; } = null!;

        // ── FK → PetPost ───────────────────────────────
        [Required]
        public int PetPostId { get; set; }

        [ForeignKey(nameof(PetPostId))]
        public PetPost PetPost { get; set; } = null!;

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}