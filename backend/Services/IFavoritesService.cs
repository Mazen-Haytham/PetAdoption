using backend.Favorites.DTOs;

namespace backend.Favorites.Services
{
    public interface IFavoritesService
    {
        Task<(bool Success, string Message)> AddFavoriteAsync(int adopterId, int petPostId);
        Task<(bool Success, string Message)> RemoveFavoriteAsync(int adopterId, int petPostId);
        Task<List<FavoritePetDto>> GetFavoritesAsync(int adopterId);
    }
}
