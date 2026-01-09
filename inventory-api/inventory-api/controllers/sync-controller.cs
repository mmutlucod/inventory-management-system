using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inventory_api.DTOs.Sync;
using inventory_api.Services.Interfaces;

namespace inventory_api.Controllers;

/// <summary>
/// Sync controller - Offline-first senkronizasyon
/// </summary>
[Authorize]
[ApiController]
[Route("api/sync")]
public class SyncController : ControllerBase
{
    private readonly ISyncService _syncService;
    private readonly ILocalizationService _localization;
    private readonly ILogger<SyncController> _logger;

    public SyncController(
        ISyncService syncService,
        ILocalizationService localization,
        ILogger<SyncController> logger)
    {
        _syncService = syncService;
        _localization = localization;
        _logger = logger;
    }

    [HttpGet("pull")]
    public async Task<ActionResult<SyncPullResponseDto>> Pull([FromQuery] long lastPulledAt = 0)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
        {
            return Unauthorized(new { error = _localization.GetString("Unauthorized") });
        }

        try
        {
            _logger.LogInformation(
                "User {UserId} pulling changes since {LastPulledAt}",
                userId,
                lastPulledAt
            );

            var response = await _syncService.PullChangesAsync(userId.Value, lastPulledAt);

            _logger.LogInformation(
                "Pull completed for user {UserId}: {Created} created, {Updated} updated, {Deleted} deleted",
                userId,
                response.Changes.Products.Created.Count,
                response.Changes.Products.Updated.Count,
                response.Changes.Products.Deleted.Count
            );

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Pull failed for user {UserId}", userId);
            return StatusCode(500, new { error = _localization.GetString("SyncPullFailed") });
        }
    }

    [HttpPost("push")]
    public async Task<IActionResult> Push([FromBody] SyncPushRequestDto request)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
        {
            return Unauthorized(new { error = _localization.GetString("Unauthorized") });
        }

        try
        {
            _logger.LogInformation(
                "User {UserId} pushing changes: {Created} created, {Updated} updated, {Deleted} deleted",
                userId,
                request.Changes.Products.Created.Count,
                request.Changes.Products.Updated.Count,
                request.Changes.Products.Deleted.Count
            );

            var success = await _syncService.PushChangesAsync(userId.Value, request);

            if (success)
            {
                _logger.LogInformation("Push completed successfully for user {UserId}", userId);
                return Ok(new
                {
                    message = _localization.GetString("SyncSuccess"),
                    success = true
                });
            }

            return StatusCode(500, new { error = _localization.GetString("SyncPushFailed") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Push failed for user {UserId}", userId);
            return StatusCode(500, new { error = _localization.GetString("SyncPushFailed") });
        }
    }

    private Guid? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }
}