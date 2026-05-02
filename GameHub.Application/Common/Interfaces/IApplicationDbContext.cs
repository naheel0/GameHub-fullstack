using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace GameHub.Application.Common.interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Game> Games { get; }
    Task<int> SaveChangeAsync(CancellationToken cancellationToken = default);
}
