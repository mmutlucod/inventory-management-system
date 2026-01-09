using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inventory_api.DTOs.Auth;
using inventory_api.Services.Interfaces;

namespace inventory_api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILocalizationService _localization;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        ILocalizationService localization,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _localization = localization;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponseDto>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
        {
            return Unauthorized(new { error = _localization.GetString("Unauthorized") });
        }

        await _authService.LogoutAsync(userId.Value);
        return Ok(new { message = _localization.GetString("LogoutSuccess") });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
        {
            return Unauthorized(new { error = _localization.GetString("Unauthorized") });
        }

        return Ok(new { userId = userId.Value, message = "Authenticated" });
    }

    private Guid? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}