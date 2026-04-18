// ── PetImage.cs ────────────────────────────────────────────────────────────
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models

{
    public class PetImage
    {
        [Key]
        public int ImageId { get; set; }

        // ── FK → PetPost ───────────────────────────────
        [Required]
        public int PetPostId { get; set; }

        [ForeignKey(nameof(PetPostId))]
        public PetPost PetPost { get; set; } = null!;

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = false;  // main display image

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}