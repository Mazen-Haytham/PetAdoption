using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Pets.DTOs
{
    public class CreatePetDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int Age { get; set; }

        [Required]
        [MaxLength(100)]
        public string Breed { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string HealthStatus { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;   // Dog, Cat, Bird …

        // Images uploaded as multipart/form-data
        public List<IFormFile> Images { get; set; } = new();
    }
}
