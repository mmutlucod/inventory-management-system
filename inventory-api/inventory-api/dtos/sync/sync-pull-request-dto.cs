using System.ComponentModel.DataAnnotations;

namespace inventory_api.DTOs.Sync;

public class SyncPullRequestDto
{
    [Range(0, long.MaxValue)]
    public long LastPulledAt { get; set; } = 0;

    public int SchemaVersion { get; set; } = 1;
}