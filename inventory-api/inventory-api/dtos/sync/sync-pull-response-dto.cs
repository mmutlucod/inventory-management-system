namespace inventory_api.DTOs.Sync;

public class SyncPullResponseDto
{
    public SyncChangesDto Changes { get; set; } = new();
    public long Timestamp { get; set; }
}