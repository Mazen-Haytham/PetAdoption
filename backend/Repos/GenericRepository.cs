using backend.Data;
using backend.Repos;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class GenericRepository<T>(AppDbContext context) : IGenericRepository<T> where T : class
    {
        private readonly DbSet<T> _dbSet = context.Set<T>();
        
        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }
        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }
        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }
        // Update & Delete are not async because EF Core
        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }
        
        // the actual DB call happens in SaveChangesAsync()
        public async Task<bool> SaveChangesAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }
    }
}