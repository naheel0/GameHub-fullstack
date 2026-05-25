using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
namespace GameHub.Application.Common.interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Game> Games { get; }
    DbSet<Address> Address { get; }
    DbSet<Purchase> Purchases { get; }
    DbSet<BlacklistedToken> BlacklistedTokens { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<Payment> Payments { get; }
    DatabaseFacade Database { get; }
    Task<int> SaveChangeAsync(CancellationToken cancellationToken = default);
}
