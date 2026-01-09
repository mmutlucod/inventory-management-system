using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace inventory_api.Models;

[Table("products")]
public class Product
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("barcode")]
    public string? Barcode { get; set; }

    [Column("stock")]
    public int Stock { get; set; } = 0;

    [Column("price", TypeName = "decimal(10,2)")]
    public decimal? Price { get; set; }

    [MaxLength(100)]
    [Column("category")]
    public string? Category { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(500)]
    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}