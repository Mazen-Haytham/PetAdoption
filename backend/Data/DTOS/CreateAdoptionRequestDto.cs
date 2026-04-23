using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Requests.DTOs
{
    public class CreateAdoptionRequestDto : IValidatableObject
    {
        [JsonPropertyName("petId")]
        public int? PetId { get; set; }

        [JsonPropertyName("petPostId")]
        public int? PetPostId { get; set; }

        [JsonIgnore]
        public int EffectivePetPostId => PetPostId ?? PetId ?? 0;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (EffectivePetPostId <= 0)
            {
                yield return new ValidationResult(
                    "petPostId (preferred) or petId is required and must be > 0.",
                    new[] { nameof(PetPostId), nameof(PetId) });
            }
        }
    }
}

