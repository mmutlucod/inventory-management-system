using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using inventory_api.Models;

namespace inventory_api.Data.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");

        builder.HasKey(sm => sm.Id);
        builder.Property(sm => sm.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(sm => sm.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        builder.Property(sm => sm.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(sm => sm.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        builder.Property(sm => sm.Type)
            .HasColumnName("type")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(sm => sm.Note)
            .HasColumnName("note")
            .HasColumnType("text");

        builder.Property(sm => sm.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.HasIndex(sm => sm.ProductId)
            .HasDatabaseName("idx_stock_movements_product_id");

        builder.HasIndex(sm => sm.UserId)
            .HasDatabaseName("idx_stock_movements_user_id");

        builder.HasIndex(sm => sm.CreatedAt)
            .HasDatabaseName("idx_stock_movements_created_at");

        builder.HasIndex(sm => new { sm.ProductId, sm.CreatedAt })
            .HasDatabaseName("idx_stock_movements_product_created");

        builder.HasCheckConstraint(
            "ck_stock_movements_type",
            "type IN ('in', 'out')"
        );
        builder.HasOne(sm => sm.Product)
            .WithMany(p => p.StockMovements)
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sm => sm.User)
            .WithMany(u => u.StockMovements)
            .HasForeignKey(sm => sm.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}