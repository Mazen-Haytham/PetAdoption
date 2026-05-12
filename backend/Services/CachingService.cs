using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace backend.Services
{
    /// <summary>
    /// Implementation of caching service using both memory cache and Redis.
    /// </summary>
    public class CachingService : ICachingService
    {
        private readonly IDistributedCache _redis;
        private readonly IMemoryCache _memory;

        // ── Cache duration ──────────────────────────
        private static readonly TimeSpan MemoryExpiry = TimeSpan.FromMinutes(2);
        private static readonly TimeSpan RedisExpiry = TimeSpan.FromMinutes(3);

        // ── Cache keys ──────────────────────────────
        private const string AllPetPostsCacheKey = "petPosts:all";
        private static string SinglePetPostCacheKey(int id) => $"petPosts:{id}";
        private static string OwnerPetPostsCacheKey(int ownerId) => $"petPosts:owner:{ownerId}";
        private static string DetailPetPostCacheKey(int id) => $"petPosts:detail:{id}";

        public CachingService(
            IDistributedCache redis,
            IMemoryCache memory)
        {
            _redis = redis;
            _memory = memory;
        }

        /// <summary>
        /// Gets value from cache or fetches from database and caches it.
        /// Tries memory cache first, then Redis, then falls back to database.
        /// </summary>
        public async Task<T?> GetOrSetCacheAsync<T>(
            string cacheKey,
            Func<Task<T?>> fetchFromDb)
        {
            // ── 1. Check Memory cache ───────────────
            try
            {
                if (_memory.TryGetValue(cacheKey, out T? memoryResult))
                {
                    Console.WriteLine($"MEMORY HIT: {cacheKey}");
                    return memoryResult;
                }
            }
            catch (Exception ex) { Console.WriteLine($"MEMORY READ FAILED [{cacheKey}]: {ex.Message}"); }

            // ── 2. Check Redis cache ────────────────
            try
            {
                var redisResult = await _redis.GetStringAsync(cacheKey);

                if (redisResult != null)
                {
                    Console.WriteLine($"REDIS HIT: {cacheKey}");
                    var deserialized = JsonSerializer.Deserialize<T>(redisResult)!;

                    // backfill memory from Redis
                    try { _memory.Set(cacheKey, deserialized, MemoryExpiry); }
                    catch (Exception ex) { Console.WriteLine($"MEMORY BACKFILL FAILED [{cacheKey}]: {ex.Message}"); }

                    return deserialized;
                }
            }
            catch (Exception ex) { Console.WriteLine($"REDIS READ FAILED [{cacheKey}]: {ex.Message}"); }

            // ── 3. Fetch from DB ────────────────────
            Console.WriteLine($"DB HIT: {cacheKey}");
            var result = await fetchFromDb();

            if (result == null) return default;

            // ── 4. Save to both caches ──────────────
            try { _memory.Set(cacheKey, result, MemoryExpiry); }
            catch (Exception ex) { Console.WriteLine($"MEMORY WRITE FAILED [{cacheKey}]: {ex.Message}"); }

            try
            {
                await _redis.SetStringAsync(cacheKey,
                    JsonSerializer.Serialize(result),
                    new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = RedisExpiry
                    });
            }
            catch (Exception ex) { Console.WriteLine($"REDIS WRITE FAILED [{cacheKey}]: {ex.Message}"); }

            return result;
        }

        /// <summary>
        /// Invalidates pet-related cache keys (all pets, single pet, owner pets, detail).
        /// </summary>
        public async Task InvalidatePetCacheAsync(int petPostId, int ownerId)
        {
            var keys = new[]
            {
                AllPetPostsCacheKey,
                SinglePetPostCacheKey(petPostId),
                OwnerPetPostsCacheKey(ownerId),
                DetailPetPostCacheKey(petPostId)
            };

            await InvalidateKeysAsync(keys);
        }

        /// <summary>
        /// Invalidates request-related cache keys (all pets, specific pet, detail, owner pets).
        /// </summary>
        public async Task InvalidateRequestRelatedCacheAsync(int petPostId, int ownerId)
        {
            var keys = new[]
            {
                AllPetPostsCacheKey,
                SinglePetPostCacheKey(petPostId),
                DetailPetPostCacheKey(petPostId),
                OwnerPetPostsCacheKey(ownerId)
            };

            await InvalidateKeysAsync(keys);
        }

        /// <summary>
        /// Invalidates a specific cache key from both memory and Redis.
        /// </summary>
        public async Task InvalidateCacheKeyAsync(string cacheKey)
        {
            await InvalidateKeysAsync(new[] { cacheKey });
        }

        /// <summary>
        /// Invalidates multiple cache keys from both memory and Redis.
        /// </summary>
        private async Task InvalidateKeysAsync(string[] keys)
        {
            foreach (var key in keys)
            {
                try { _memory.Remove(key); }
                catch (Exception ex) { Console.WriteLine($"MEMORY INVALIDATION FAILED [{key}]: {ex.Message}"); }

                try { await _redis.RemoveAsync(key); }
                catch (Exception ex) { Console.WriteLine($"REDIS INVALIDATION FAILED [{key}]: {ex.Message}"); }
            }
        }
    }
}
