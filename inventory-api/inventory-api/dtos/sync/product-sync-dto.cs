namespace inventory_api.DTOs.Sync;

public class ProductSyncDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int Stock { get; set; }
    public decimal? Price { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public long CreatedAt { get; set; }
    public long UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
}