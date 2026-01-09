using System.ComponentModel.DataAnnotations;

namespace inventory_api.DTOs.Product;

public class UpdateProductDto
{
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Barcode { get; set; }

    public int Stock { get; set; }

    public decimal? Price { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public DateTime UpdatedAt { get; set; }
}