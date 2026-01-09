using Microsoft.EntityFrameworkCore;
using inventory_api.Data;
using inventory_api.DTOs.Sync;
using inventory_api.Models;
using inventory_api.Repositories.Interfaces;
using inventory_api.Services.Interfaces;

namespace inventory_api.Services.Implementations;

public class SyncService : ISyncService
{
    private readonly IProductRepository _productRepository;
    private readonly AppDbContext _context;

    public SyncService(
        IProductRepository productRepository,
        AppDbContext context)
    {
        _productRepository = productRepository;
        _context = context;
    }

    public async Task<SyncPullResponseDto> PullChangesAsync(Guid userId, long lastPulledAt)
    {
        try
        {
            var lastPulledDate = DateTimeOffset.FromUnixTimeMilliseconds(lastPulledAt).UtcDateTime;

            var changedProducts = await _productRepository.GetChangedSinceAsync(userId, lastPulledDate);

            var createdProducts = changedProducts
                .Where(p => !p.IsDeleted && p.CreatedAt >= lastPulledDate)
                .Select(MapToSyncDto)
                .ToList();
            var updatedProducts = changedProducts
                .Where(p => !p.IsDeleted && p.UpdatedAt > p.CreatedAt && p.CreatedAt < lastPulledDate)
                .Select(MapToSyncDto)
                .ToList();

            var deletedProductIds = changedProducts
                .Where(p => p.IsDeleted)
                .Select(p => p.Id)
                .ToList();
            var response = new SyncPullResponseDto
            {
                Changes = new SyncChangesDto
                {
                    Products = new ProductChangesDto
                    {
                        Created = createdProducts,
                        Updated = updatedProducts,
                        Deleted = deletedProductIds
                    }
                },
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            var totalRecords = createdProducts.Count + updatedProducts.Count + deletedProductIds.Count;
            await LogSyncAsync(userId, "pull", totalRecords, "success");

            return response;
        }
        catch (Exception ex)
        {
            await LogSyncAsync(userId, "pull", 0, "failed", ex.Message);
            throw;
        }
    }

    public async Task<bool> PushChangesAsync(Guid userId, SyncPushRequestDto request)
    {
        try
        {
            var totalRecords = 0;
            foreach (var productDto in request.Changes.Products.Created)
            {
                var existingProduct = await _productRepository.GetByIdAsync(productDto.Id);

                if (existingProduct == null)
                {
                    var product = new Product
                    {
                        Id = productDto.Id,
                        UserId = userId,
                        Name = productDto.Name,
                        Barcode = productDto.Barcode,
                        Stock = productDto.Stock,
                        Price = productDto.Price,
                        Category = productDto.Category,
                        Description = productDto.Description,
                        ImageUrl = productDto.ImageUrl,
                        CreatedAt = DateTimeOffset.FromUnixTimeMilliseconds(productDto.CreatedAt).UtcDateTime,
                        UpdatedAt = DateTimeOffset.FromUnixTimeMilliseconds(productDto.UpdatedAt).UtcDateTime,
                        IsDeleted = productDto.IsDeleted
                    };

                    await _productRepository.AddAsync(product);
                    totalRecords++;
                }
                else
                {
                    await HandleUpdateConflict(existingProduct, productDto, userId);
                    totalRecords++;
                }
            }

            foreach (var productDto in request.Changes.Products.Updated)
            {
                var product = await _productRepository.GetByIdAsync(productDto.Id);

                if (product != null && product.UserId == userId)
                {
                    await HandleUpdateConflict(product, productDto, userId);
                    totalRecords++;
                }
            }
            foreach (var productId in request.Changes.Products.Deleted)
            {
                var success = await _productRepository.SoftDeleteAsync(productId, userId);
                if (success)
                {
                    totalRecords++;
                }
            }
            await _context.SaveChangesAsync();

            await LogSyncAsync(userId, "push", totalRecords, "success");

            return true;
        }
        catch (Exception ex)
        {
            await LogSyncAsync(userId, "push", 0, "failed", ex.Message);
            throw;
        }
    }

    public async Task LogSyncAsync(Guid userId, string syncType, int recordCount, string status, string? errorMessage = null)
    {
        var syncLog = new SyncLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SyncType = syncType,
            RecordCount = recordCount,
            Status = status,
            ErrorMessage = errorMessage,
            CreatedAt = DateTime.UtcNow
        };

        _context.SyncLogs.Add(syncLog);
        await _context.SaveChangesAsync();
    }

    private async Task HandleUpdateConflict(Product existingProduct, ProductSyncDto incomingDto, Guid userId)
    {
        var incomingTimestamp = DateTimeOffset.FromUnixTimeMilliseconds(incomingDto.UpdatedAt).UtcDateTime;
        var serverTimestamp = existingProduct.UpdatedAt;
        if (incomingTimestamp > serverTimestamp)
        {
            existingProduct.Name = incomingDto.Name;
            existingProduct.Barcode = incomingDto.Barcode;
            existingProduct.Stock = incomingDto.Stock;
            existingProduct.Price = incomingDto.Price;
            existingProduct.Category = incomingDto.Category;
            existingProduct.Description = incomingDto.Description;
            existingProduct.ImageUrl = incomingDto.ImageUrl;
            existingProduct.UpdatedAt = incomingTimestamp;
            existingProduct.IsDeleted = incomingDto.IsDeleted;

            _productRepository.Update(existingProduct);
        }
        else
        {

        }

        await Task.CompletedTask;
    }

    private static ProductSyncDto MapToSyncDto(Product product)
    {
        return new ProductSyncDto
        {
            Id = product.Id,
            Name = product.Name,
            Barcode = product.Barcode,
            Stock = product.Stock,
            Price = product.Price,
            Category = product.Category,
            Description = product.Description,
            ImageUrl = product.ImageUrl,
            CreatedAt = new DateTimeOffset(product.CreatedAt).ToUnixTimeMilliseconds(),
            UpdatedAt = new DateTimeOffset(product.UpdatedAt).ToUnixTimeMilliseconds(),
            IsDeleted = product.IsDeleted
        };
    }
}