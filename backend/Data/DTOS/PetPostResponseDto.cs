namespace backend.Pets.DTOs
{
    public class PetPostResponseDto
    {
        public int PetPostId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string HealthStatus { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // ── Pet Info ───────────────────────────────
        public int PetId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Breed { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        public int Age { get; set; }

        // ── Owner Info ─────────────────────────────
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;

        // ── Images ─────────────────────────────────
        public List<string> Images { get; set; } = new();
        public string? PrimaryImage { get; set; }
    }
}