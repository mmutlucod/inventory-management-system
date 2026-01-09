using System.ComponentModel.DataAnnotations;

namespace inventory_api.DTOs.Product;

public class StockMovementDto
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public Guid UserId { get; set; }

    public int Quantity { get; set; }

    public string Type { get; set; } = string.Empty;

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? ProductName { get; set; }
}