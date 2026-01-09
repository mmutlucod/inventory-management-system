using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using inventory_api.Models;

namespace inventory_api.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .IsRequired();

        builder.Property(u => u.Name)
            .HasColumnName("name")
            .HasMaxLength(255);

        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasMaxLength(50)
            .HasDefaultValue("User")
            .IsRequired();

        builder.Property(u => u.RefreshToken)
            .HasColumnName("refresh_token");

        builder.Property(u => u.RefreshTokenExpiry)
            .HasColumnName("refresh_token_expiry");

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.Property(u => u.IsDeleted)
            .HasColumnName("is_deleted")
            .HasDefaultValue(false)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("idx_users_email");

        builder.HasIndex(u => u.IsDeleted)
            .HasDatabaseName("idx_users_is_deleted");

        builder.HasIndex(u => u.RefreshToken)
            .HasDatabaseName("idx_users_refresh_token");

        builder.HasIndex(u => u.Role)
            .HasDatabaseName("idx_users_role");

        builder.HasMany(u => u.Products)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.StockMovements)
            .WithOne(sm => sm.User)
            .HasForeignKey(sm => sm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.SyncLogs)
            .WithOne(sl => sl.User)
            .HasForeignKey(sl => sl.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}