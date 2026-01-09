using inventory_api.Data;
using inventory_api.DTOs.Product;
using inventory_api.Models;
using inventory_api.Repositories.Interfaces;
using inventory_api.Services.Interfaces;

namespace inventory_api.Services.Implementations;

public class StockMovementService : IStockMovementService
{
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IProductRepository _productRepository;
    private readonly ILocalizationService _localization;
    private readonly AppDbContext _context;

    public StockMovementService(
        IStockMovementRepository stockMovementRepository,
        IProductRepository productRepository,
        ILocalizationService localization,
        AppDbContext context)
    {
        _stockMovementRepository = stockMovementRepository;
        _productRepository = productRepository;
        _localization = localization;
        _context = context;
    }

    public async Task<StockMovementDto> AddMovementAsync(
        Guid productId,
        int quantity,
        string type,
        string? note,
        Guid userId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null || product.UserId != userId)
        {
            throw new InvalidOperationException(_localization.GetString("ProductNotFound"));
        }
        if (type != "in" && type != "out")
        {
            throw new ArgumentException(_localization.GetString("InvalidMovementType"));
        }

        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            UserId = userId,
            Quantity = quantity,
            Type = type,
            Note = note,
            CreatedAt = DateTime.UtcNow
        };
        if (type == "in")
        {
            product.Stock += quantity;
        }
        else 
        {
            if (product.Stock < quantity)
            {
                throw new InvalidOperationException(_localization.GetString("InsufficientStock"));
            }
            product.Stock -= quantity;
        }

        product.UpdatedAt = DateTime.UtcNow;

        await _stockMovementRepository.AddAsync(movement);
        _productRepository.Update(product);
        await _context.SaveChangesAsync();

        return MapToDto(movement, product.Name);
    }

    public async Task<IEnumerable<StockMovementDto>> GetByProductIdAsync(Guid productId, Guid userId)
    {
        var movements = await _stockMovementRepository.GetByProductIdAsync(productId);
        return movements
            .Where(m => m.UserId == userId)
            .Select(m => MapToDto(m, m.Product?.Name))
            .ToList();
    }

    public async Task<IEnumerable<StockMovementDto>> GetRecentMovementsAsync(Guid userId, int count = 10)
    {
        var movements = await _stockMovementRepository.GetRecentMovementsAsync(userId, count);
        return movements.Select(m => MapToDto(m, m.Product?.Name)).ToList();
    }

    private static StockMovementDto MapToDto(StockMovement movement, string? productName)
    {
        return new StockMovementDto
        {
            Id = movement.Id,
            ProductId = movement.ProductId,
            UserId = movement.UserId,
            Quantity = movement.Quantity,
            Type = movement.Type,
            Note = movement.Note,
            CreatedAt = movement.CreatedAt,
            ProductName = productName
        };
    }
}