using System.ComponentModel.DataAnnotations;

namespace inventory_api.DTOs.Sync;

public class SyncPushRequestDto
{
    [Required]
    public SyncChangesDto Changes { get; set; } = new();

    public long LastPulledAt { get; set; }
}