using inventory_api.Models;

namespace inventory_api.Repositories.Interfaces;

public interface IStockMovementRepository : IGenericRepository<StockMovement>
{
    Task<IEnumerable<StockMovement>> GetByProductIdAsync(Guid productId);

    Task<IEnumerable<StockMovement>> GetByUserIdAsync(Guid userId);

    /// <summary>
    Task<IEnumerable<StockMovement>> GetByDateRangeAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate
    );

    Task<IEnumerable<StockMovement>> GetRecentMovementsAsync(Guid userId, int count = 10);
}