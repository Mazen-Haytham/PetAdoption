namespace backend.Pets.DTOs
{
    public class PetSearchDto
    {
        public string? Type { get; set; }       // Dog, Cat, Bird ...
        public string? Breed { get; set; }
        public int? Age { get; set; }
        public string? Location { get; set; }
    }
}