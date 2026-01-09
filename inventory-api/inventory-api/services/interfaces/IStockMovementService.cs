using inventory_api.DTOs.Product;

namespace inventory_api.Services.Interfaces;

public interface IStockMovementService
{
    Task<StockMovementDto> AddMovementAsync(Guid productId, int quantity, string type, string? note, Guid userId);

    Task<IEnumerable<StockMovementDto>> GetByProductIdAsync(Guid productId, Guid userId);

    Task<IEnumerable<StockMovementDto>> GetRecentMovementsAsync(Guid userId, int count = 10);
}