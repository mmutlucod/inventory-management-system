using inventory_api.DTOs.Auth;

namespace inventory_api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request);

    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);

    Task<LoginResponseDto> RefreshTokenAsync(string refreshToken);

    Task<bool> LogoutAsync(Guid userId);

    Task<bool> EmailExistsAsync(string email);
}