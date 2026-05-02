using backend.Data;
using backend.Favorites.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Favorites.Services
{
    public class FavoritesService : IFavoritesService
    {
        private readonly AppDbContext _db;

        public FavoritesService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<(bool Success, string Message)> AddFavoriteAsync(int adopterId, int petPostId)
        {
            // Check pet post exists and is available
            var petPost = await _db.PetPosts
                .FirstOrDefaultAsync(p => p.Id == petPostId);

            if (petPost is null)
                return (false, "Pet post not found.");

            // Check not already favorited
            var exists = await _db.UserFavourites
                .AnyAsync(uf => uf.AdopterId == adopterId && uf.PetPostId == petPostId);

            if (exists)
                return (false, "Already in favorites.");

            var favorite = new UserFavourite
            {
                AdopterId = adopterId,
                PetPostId = petPostId,
                SavedAt = DateTime.UtcNow
            };

            _db.UserFavourites.Add(favorite);
            await _db.SaveChangesAsync();

            return (true, "Added to favorites successfully.");
        }

        public async Task<(bool Success, string Message)> RemoveFavoriteAsync(int adopterId, int petPostId)
        {
            var favorite = await _db.UserFavourites
                .FirstOrDefaultAsync(uf => uf.AdopterId == adopterId && uf.PetPostId == petPostId);

            if (favorite is null)
                return (false, "Favorite not found.");

            _db.UserFavourites.Remove(favorite);
            await _db.SaveChangesAsync();

            return (true, "Removed from favorites successfully.");
        }

        public async Task<List<FavoritePetDto>> GetFavoritesAsync(int adopterId)
        {
            var favorites = await _db.UserFavourites
                .Where(uf => uf.AdopterId == adopterId)
                .Include(uf => uf.PetPost)
                    .ThenInclude(pp => pp.Pet)
                .Include(uf => uf.PetPost)
                    .ThenInclude(pp => pp.Images)
                .OrderByDescending(uf => uf.SavedAt)
                .Select(uf => new FavoritePetDto
                {
                    Id = uf.PetPost.Id,
                    Name = uf.PetPost.Pet.Name,
                    Breed = uf.PetPost.Pet.Breed,
                    Type = uf.PetPost.Pet.Type,
                    Location = uf.PetPost.Pet.Location,
                    Age = uf.PetPost.Pet.Age,
                    Image = uf.PetPost.Images
                        .Where(img => img.IsPrimary)
                        .Select(img => img.ImageUrl)
                        .FirstOrDefault()
                        ?? uf.PetPost.Images
                        .Select(img => img.ImageUrl)
                        .FirstOrDefault(),
                    SavedAt = uf.SavedAt
                })
                .ToListAsync();

            return favorites;
        }
    }
}
