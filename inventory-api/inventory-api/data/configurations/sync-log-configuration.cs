using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using inventory_api.Models;

namespace inventory_api.Data.Configurations;

public class SyncLogConfiguration : IEntityTypeConfiguration<SyncLog>
{
    public void Configure(EntityTypeBuilder<SyncLog> builder)
    {
        builder.ToTable("sync_logs");

        builder.HasKey(sl => sl.Id);
        builder.Property(sl => sl.Id)
            .HasColumnName("id")
            .IsRequired();

 
        builder.Property(sl => sl.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(sl => sl.SyncType)
            .HasColumnName("sync_type")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(sl => sl.RecordCount)
            .HasColumnName("record_count")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(sl => sl.Status)
            .HasColumnName("status")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(sl => sl.ErrorMessage)
            .HasColumnName("error_message")
            .HasColumnType("text");

        builder.Property(sl => sl.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();
        builder.HasIndex(sl => sl.UserId)
            .HasDatabaseName("idx_sync_logs_user_id");

        builder.HasIndex(sl => sl.CreatedAt)
            .HasDatabaseName("idx_sync_logs_created_at");

        builder.HasIndex(sl => new { sl.UserId, sl.CreatedAt })
            .HasDatabaseName("idx_sync_logs_user_created");

        builder.HasCheckConstraint(
            "ck_sync_logs_type",
            "sync_type IN ('pull', 'push')"
        );

        builder.HasCheckConstraint(
            "ck_sync_logs_status",
            "status IN ('success', 'failed', 'partial')"
        );

        builder.HasOne(sl => sl.User)
            .WithMany(u => u.SyncLogs)
            .HasForeignKey(sl => sl.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}