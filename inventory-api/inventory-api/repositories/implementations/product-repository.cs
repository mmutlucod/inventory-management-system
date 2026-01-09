using Microsoft.EntityFrameworkCore;
using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Repositories.Interfaces;

namespace inventory_api.Repositories.Implementations;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Product>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Product?> GetByBarcodeAsync(Guid userId, string barcode)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Barcode == barcode);
    }

    public async Task<IEnumerable<Product>> GetChangedSinceAsync(Guid userId, DateTime lastPulledAt)
    {
        return await _dbSet
            .IgnoreQueryFilters()
            .Where(p => p.UserId == userId && p.UpdatedAt > lastPulledAt)
            .OrderBy(p => p.UpdatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetLowStockProductsAsync(Guid userId, int threshold = 10)
    {
        return await _dbSet
            .Where(p => p.UserId == userId && p.Stock <= threshold)
            .OrderBy(p => p.Stock)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetByCategoryAsync(Guid userId, string category)
    {
        return await _dbSet
            .Where(p => p.UserId == userId && p.Category == category)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> SearchProductsAsync(Guid userId, string searchTerm)
    {
        var lowerSearchTerm = searchTerm.ToLower();

        return await _dbSet
            .Where(p => p.UserId == userId &&
                (p.Name.ToLower().Contains(lowerSearchTerm) ||
                 (p.Barcode != null && p.Barcode.Contains(searchTerm))))
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<bool> SoftDeleteAsync(Guid id, Guid userId)
    {
        var product = await _dbSet
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (product == null)
        {
            return false;
        }

        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;

        return true;
    }

    public async Task<IEnumerable<Product>> GetDeletedProductsAsync(Guid userId)
    {
        return await _dbSet
            .IgnoreQueryFilters()
            .Where(p => p.UserId == userId && p.IsDeleted)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();
    }
}