using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace inventory_api.Models;

[Table("sync_logs")]
public class SyncLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("sync_type")]
    public string SyncType { get; set; } = string.Empty;

    [Column("record_count")]
    public int RecordCount { get; set; } = 0;

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}