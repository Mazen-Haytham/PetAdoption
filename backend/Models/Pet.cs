using backend.Data;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class Pet
    {
        [Key]
        public int Id { get; set; }

        // ── Owner (Shelter / Pet Owner) ────────────────
        [Required]
        public int OwnerId { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public User Owner { get; set; } = null!;

        // ── Pet Info (filled from the form) ────────────
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;   // e.g. Dog, Cat, Bird

        [MaxLength(100)]
        [Required]
        public string Breed { get; set; }

        [MaxLength(200)]
        [Required]
        public string Location { get; set; }

        

        [Required]
        public int Age { get; set; }

        // ── Post Metadata ──────────────────────────────
        public PetStatus Status { get; set; } = PetStatus.Available;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation ─────────────────────────────────
        //public ICollection<PetImage> Images { get; set; } = new List<PetImage>();
        //public ICollection<UserFavourite> UserFavourites { get; set; } = new List<UserFavourite>();
        //public ICollection<Adoption> Adoptions { get; set; } = new List<Adoption>();
        //public ICollection<Request> Requests { get; set; } = new List<Request>();
    }
}
