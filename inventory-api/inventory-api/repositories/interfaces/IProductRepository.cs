using inventory_api.Models;

namespace inventory_api.Repositories.Interfaces;

public interface IProductRepository : IGenericRepository<Product>
{
    Task<IEnumerable<Product>> GetByUserIdAsync(Guid userId);

    Task<Product?> GetByBarcodeAsync(Guid userId, string barcode);

    Task<IEnumerable<Product>> GetChangedSinceAsync(Guid userId, DateTime lastPulledAt);

    Task<IEnumerable<Product>> GetLowStockProductsAsync(Guid userId, int threshold = 10);

    Task<IEnumerable<Product>> GetByCategoryAsync(Guid userId, string category);

    Task<IEnumerable<Product>> SearchProductsAsync(Guid userId, string searchTerm);

    Task<bool> SoftDeleteAsync(Guid id, Guid userId);

    Task<IEnumerable<Product>> GetDeletedProductsAsync(Guid userId);
}