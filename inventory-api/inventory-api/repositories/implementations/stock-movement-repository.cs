using Microsoft.EntityFrameworkCore;
using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Repositories.Interfaces;

namespace inventory_api.Repositories.Implementations;

public class StockMovementRepository : GenericRepository<StockMovement>, IStockMovementRepository
{
    public StockMovementRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<StockMovement>> GetByProductIdAsync(Guid productId)
    {
        return await _dbSet
            .Include(sm => sm.Product)
            .Where(sm => sm.ProductId == productId)
            .OrderByDescending(sm => sm.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockMovement>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Include(sm => sm.Product)
            .Where(sm => sm.UserId == userId)
            .OrderByDescending(sm => sm.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockMovement>> GetByDateRangeAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate)
    {
        return await _dbSet
            .Include(sm => sm.Product)
            .Where(sm => sm.UserId == userId &&
                        sm.CreatedAt >= startDate &&
                        sm.CreatedAt <= endDate)
            .OrderByDescending(sm => sm.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockMovement>> GetRecentMovementsAsync(Guid userId, int count = 10)
    {
        return await _dbSet
            .Include(sm => sm.Product)
            .Where(sm => sm.UserId == userId)
            .OrderByDescending(sm => sm.CreatedAt)
            .Take(count)
            .ToListAsync();
    }
}