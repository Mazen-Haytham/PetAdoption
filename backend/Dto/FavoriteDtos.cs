namespace backend.Favorites.DTOs
{
    public class FavoritePetDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Breed { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int Age { get; set; }
        public string? Image { get; set; }
        public DateTime SavedAt { get; set; }
    }
}
