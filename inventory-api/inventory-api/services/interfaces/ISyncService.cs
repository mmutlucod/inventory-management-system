using inventory_api.DTOs.Sync;

namespace inventory_api.Services.Interfaces;

public interface ISyncService
{
    Task<SyncPullResponseDto> PullChangesAsync(Guid userId, long lastPulledAt);

    Task<bool> PushChangesAsync(Guid userId, SyncPushRequestDto request);

    Task LogSyncAsync(Guid userId, string syncType, int recordCount, string status, string? errorMessage = null);
}