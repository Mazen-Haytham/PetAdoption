namespace backend.Services
{
    /// <summary>
    /// Provides caching abstraction for distributed (Redis) and memory caches.
    /// </summary>
    public interface ICachingService
    {
        /// <summary>
        /// Gets value from cache or fetches from database and caches it.
        /// Tries memory cache first, then Redis, then falls back to database.
        /// </summary>
        Task<T?> GetOrSetCacheAsync<T>(
            string cacheKey,
            Func<Task<T?>> fetchFromDb);

        /// <summary>
        /// Invalidates pet-related cache keys (all pets, single pet, owner pets, detail).
        /// </summary>
        Task InvalidatePetCacheAsync(int petPostId, int ownerId);

        /// <summary>
        /// Invalidates request-related cache keys (all pets, specific pet, detail, owner pets).
        /// </summary>
        Task InvalidateRequestRelatedCacheAsync(int petPostId, int ownerId);

        /// <summary>
        /// Invalidates a specific cache key from both memory and Redis.
        /// </summary>
        Task InvalidateCacheKeyAsync(string cacheKey);
    }
}
