using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class AdoptionHistory
    {
        [Key]
        public int Id { get; set; }

        // ── FK → User (Adopter) ────────────────────────
        [Required]
        public int AdopterId { get; set; }

        [ForeignKey(nameof(AdopterId))]
        public User Adopter { get; set; } = null!;

        // ── Manually entered past experience ───────────
        [Required]
        [MaxLength(100)]
        public string PetName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string PetType { get; set; } = string.Empty;  // Dog, Cat, etc.

        [Required]
        public int Year { get; set; }   // Year they adopted the pet

        public string? Notes { get; set; }  // Any extra details they want to add
    }
}