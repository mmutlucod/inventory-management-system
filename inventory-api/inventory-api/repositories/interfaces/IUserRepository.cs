using inventory_api.Models;

namespace inventory_api.Repositories.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);

    Task<User?> GetByRefreshTokenAsync(string refreshToken);

    Task<bool> EmailExistsAsync(string email);

    Task UpdateRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiry);
}