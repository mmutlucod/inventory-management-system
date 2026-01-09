using inventory_api.DTOs.Product;

namespace inventory_api.Services.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync(Guid userId);

    Task<ProductDto?> GetByIdAsync(Guid id, Guid userId);

    Task<ProductDto?> GetByBarcodeAsync(string barcode, Guid userId);

    Task<ProductDto> CreateAsync(CreateProductDto dto, Guid userId);

    Task<ProductDto?> UpdateAsync(Guid id, UpdateProductDto dto, Guid userId);

    Task<bool> DeleteAsync(Guid id, Guid userId);

    Task<IEnumerable<ProductDto>> SearchAsync(string searchTerm, Guid userId);

    Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(Guid userId, int threshold = 10);

    Task<IEnumerable<ProductDto>> GetByCategoryAsync(string category, Guid userId);
}