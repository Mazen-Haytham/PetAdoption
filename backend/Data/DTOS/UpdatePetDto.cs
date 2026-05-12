// DTOs/UpdatePetDto.cs  ← new file
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Pets.DTOs
{
    public class UpdatePetDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        public int? Age { get; set; }

        [MaxLength(100)]
        public string? Breed { get; set; }

        [MaxLength(50)]
        public string? Type { get; set; }

        [MaxLength(10)]
        public string? Gender { get; set; }

        [MaxLength(100)]
        public string? HealthStatus { get; set; }

        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }
    }
}