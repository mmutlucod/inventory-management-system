using inventory_api.Data;
using inventory_api.DTOs.Auth;
using inventory_api.Models;
using inventory_api.Repositories.Interfaces;
using inventory_api.Services.Interfaces;

namespace inventory_api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly ILocalizationService _localization;
    private readonly AppDbContext _context;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        ILocalizationService localization,
        AppDbContext context)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _localization = localization;
        _context = context;
    }

    public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException(_localization.GetString("EmailAlreadyInUse"));
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name,
            Role = nameof(UserRole.User),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var refreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _userRepository.AddAsync(user);
        await _context.SaveChangesAsync();
        var accessToken = _tokenService.GenerateAccessToken(user);

        return new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(1440),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException(_localization.GetString("InvalidCredentials"));
        }
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException(_localization.GetString("InvalidCredentials"));
        }

        var refreshToken = _tokenService.GenerateRefreshToken();
        await _userRepository.UpdateRefreshTokenAsync(user.Id, refreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync();

        var accessToken = _tokenService.GenerateAccessToken(user);

        return new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(1440),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);
        if (user == null)
        {
            throw new UnauthorizedAccessException(_localization.GetString("InvalidRefreshToken"));
        }

        var newRefreshToken = _tokenService.GenerateRefreshToken();
        await _userRepository.UpdateRefreshTokenAsync(user.Id, newRefreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync();
        var accessToken = _tokenService.GenerateAccessToken(user);

        return new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(1440),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<bool> LogoutAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;
        _userRepository.Update(user);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _userRepository.EmailExistsAsync(email);
    }
}