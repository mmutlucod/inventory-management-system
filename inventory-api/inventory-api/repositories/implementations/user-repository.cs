using Microsoft.EntityFrameworkCore;
using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Repositories.Interfaces;

namespace inventory_api.Repositories.Implementations;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken &&
                                     u.RefreshTokenExpiry > DateTime.UtcNow);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _dbSet
            .AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task UpdateRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiry)
    {
        var user = await GetByIdAsync(userId);

        if (user != null)
        {
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = expiry;
            user.UpdatedAt = DateTime.UtcNow;
        }
    }
}