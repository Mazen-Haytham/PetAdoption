using backend.Models;
using backend.Pets.DTOs;

namespace backend.Pets.Mapping
{
    public static class PetPostResponseMapper
    {
        /// <summary>Same projection as <c>GET /api/pets/mine</c> (<see cref="PetPostResponseDto"/>).</summary>
        public static PetPostResponseDto? Map(PetPost? pp)
        {
            if (pp?.Pet is null)
                return null;

            return new PetPostResponseDto
            {
                PetPostId = pp.Id,
                Description = pp.Description ?? string.Empty,
                HealthStatus = pp.HealthStatus ?? string.Empty,
                Status = pp.Status.ToString(),
                CreatedAt = pp.CreatedAt,
                PetId = pp.Pet.Id,
                Name = pp.Pet.Name,
                Type = pp.Pet.Type,
                Breed = pp.Pet.Breed,
                Location = pp.Pet.Location,
                Age = pp.Pet.Age,
                OwnerId = pp.Owner?.Id ?? pp.OwnerId,
                OwnerName = pp.Owner?.Name ?? string.Empty,
                Images = pp.Images.Select(img => img.ImageUrl).ToList(),
                PrimaryImage = pp.Images.FirstOrDefault(img => img.IsPrimary)?.ImageUrl
                    ?? pp.Images.Select(img => img.ImageUrl).FirstOrDefault()
            };
        }
    }
}
