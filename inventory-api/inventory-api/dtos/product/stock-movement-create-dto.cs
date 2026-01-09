namespace inventory_api.DTOs.Product;

public class StockMovementCreateDto
{
	public Guid ProductId { get; set; }
	public int Quantity { get; set; }
	public string Type { get; set; } = string.Empty;
	public string? Note { get; set; }
}