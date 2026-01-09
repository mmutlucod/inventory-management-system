using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using inventory_api.Models;

namespace inventory_api.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(p => p.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(p => p.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(p => p.Barcode)
            .HasColumnName("barcode")
            .HasMaxLength(100);

        builder.Property(p => p.Stock)
            .HasColumnName("stock")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(p => p.Price)
            .HasColumnName("price")
            .HasColumnType("decimal(10,2)");

        builder.Property(p => p.Category)
            .HasColumnName("category")
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(p => p.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(500);

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.Property(p => p.IsDeleted)
            .HasColumnName("is_deleted")
            .HasDefaultValue(false)
            .IsRequired();

        builder.HasIndex(p => p.UserId)
            .HasDatabaseName("idx_products_user_id");

        builder.HasIndex(p => p.Barcode)
            .HasDatabaseName("idx_products_barcode");

        builder.HasIndex(p => p.UpdatedAt)
            .HasDatabaseName("idx_products_updated_at"); 

        builder.HasIndex(p => p.IsDeleted)
            .HasDatabaseName("idx_products_deleted");

        builder.HasIndex(p => new { p.UserId, p.UpdatedAt })
            .HasDatabaseName("idx_products_user_updated"); 

        builder.HasIndex(p => new { p.UserId, p.Barcode })
            .HasDatabaseName("idx_products_user_barcode"); 


        builder.HasOne(p => p.User)
            .WithMany(u => u.Products)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.StockMovements)
            .WithOne(sm => sm.Product)
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}