using inventory_api.Data;
using inventory_api.DTOs.Product;
using inventory_api.Models;
using inventory_api.Repositories.Interfaces;
using inventory_api.Services.Interfaces;

namespace inventory_api.Services.Implementations;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ILocalizationService _localization;
    private readonly AppDbContext _context;

    public ProductService(
        IProductRepository productRepository,
        ILocalizationService localization,
        AppDbContext context)
    {
        _productRepository = productRepository;
        _localization = localization;
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(Guid userId)
    {
        var products = await _productRepository.GetByUserIdAsync(userId);
        return products.Select(MapToDto);
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var product = await _productRepository.GetByIdAsync(id);

        if (product == null || product.UserId != userId)
        {
            return null;
        }

        return MapToDto(product);
    }

    public async Task<ProductDto?> GetByBarcodeAsync(string barcode, Guid userId)
    {
        var product = await _productRepository.GetByBarcodeAsync(userId, barcode);
        return product != null ? MapToDto(product) : null;
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, Guid userId)
    {
        var product = new Product
        {
            Id = dto.Id,
            UserId = userId,
            Name = dto.Name,
            Barcode = dto.Barcode,
            Stock = dto.Stock,
            Price = dto.Price,
            Category = dto.Category,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _productRepository.AddAsync(product);
        await _context.SaveChangesAsync();

        return MapToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(Guid id, UpdateProductDto dto, Guid userId)
    {
        var product = await _productRepository.GetByIdAsync(id);

        if (product == null || product.UserId != userId)
        {
            return null;
        }

        if (dto.UpdatedAt < product.UpdatedAt)
        {
            throw new InvalidOperationException(_localization.GetString("ProductVersionConflict"));
        }

        product.Name = dto.Name;
        product.Barcode = dto.Barcode;
        product.Stock = dto.Stock;
        product.Price = dto.Price;
        product.Category = dto.Category;
        product.Description = dto.Description;
        product.ImageUrl = dto.ImageUrl;
        product.UpdatedAt = DateTime.UtcNow;

        _productRepository.Update(product);
        await _context.SaveChangesAsync();

        return MapToDto(product);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var result = await _productRepository.SoftDeleteAsync(id, userId);
        if (result)
        {
            await _context.SaveChangesAsync();
        }
        return result;
    }

    public async Task<IEnumerable<ProductDto>> SearchAsync(string searchTerm, Guid userId)
    {
        var products = await _productRepository.SearchProductsAsync(userId, searchTerm);
        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(Guid userId, int threshold = 10)
    {
        var products = await _productRepository.GetLowStockProductsAsync(userId, threshold);
        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductDto>> GetByCategoryAsync(string category, Guid userId)
    {
        var products = await _productRepository.GetByCategoryAsync(userId, category);
        return products.Select(MapToDto);
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            UserId = product.UserId,
            Name = product.Name,
            Barcode = product.Barcode,
            Stock = product.Stock,
            Price = product.Price,
            Category = product.Category,
            Description = product.Description,
            ImageUrl = product.ImageUrl,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            IsDeleted = product.IsDeleted
        };
    }
}