namespace backend.Pets.DTOs
{
    public class PetPostDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Breed { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string HealthStatus { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new();
        public OwnerSummaryDto Owner { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class OwnerSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}