namespace backend.Requests.DTOs
{
    public class RequestResponseDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // ── Adopter Info ───────────────────────────
        public int AdopterId { get; set; }
        public string AdopterName { get; set; } = string.Empty;

        // ── PetPost Info ───────────────────────────
        public int PetPostId { get; set; }
        public string PetName { get; set; } = string.Empty;
        public string PetBreed { get; set; } = string.Empty;
        public string? PrimaryImage { get; set; }
    }
}