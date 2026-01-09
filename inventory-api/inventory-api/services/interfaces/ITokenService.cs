using inventory_api.Models;

namespace inventory_api.Services.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);

    string GenerateRefreshToken();

    Guid? GetUserIdFromToken(string token);

    bool ValidateToken(string token);
}