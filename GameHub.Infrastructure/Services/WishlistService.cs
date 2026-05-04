using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;         
using GameHub.Application.DTOs.Wishlist;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Infrastructure.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly IApplicationDbContext _context;

        public WishlistService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<WishlistItemDto>> GetWishlistItemsAsync(int userId)
        {
            var items = await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return items.Select(w => new WishlistItemDto
            {
                GameId = w.GameId,
                GameName = w.GameName,
                Image = w.ImageUrl,
                Price = w.Price,
            }).ToList();
        }

        public async Task AddToWishlistAsync(int userId, int gameId)
        {
            var game = await _context.Games.FindAsync(gameId)
                       ?? throw new KeyNotFoundException("Game not found");

            var alreadyExists = await _context.WishlistItems
                .AnyAsync(w => w.UserId == userId && w.GameId == gameId);

            if (alreadyExists)
                return;

            _context.WishlistItems.Add(new WishlistItem
            {
                UserId = userId,
                GameId = gameId,
                GameName = game.Name,
                ImageUrl = game.Image?.FirstOrDefault() ?? string.Empty,
                Price = game.Price,
            });

            await _context.SaveChangeAsync();
        }

        public async Task RemoveFromWishlistAsync(int userId, int gameId)
        {
            var item = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.GameId == gameId);

            if (item is not null)
            {
                _context.WishlistItems.Remove(item);
                await _context.SaveChangeAsync();
            }
        }

        public async Task MoveToCartAsync(int userId, int gameId)
        {
            var wishItem = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.GameId == gameId)
                ?? throw new KeyNotFoundException("Item not found in wishlist");

            var game = await _context.Games.FindAsync(gameId)
                       ?? throw new KeyNotFoundException("Game not found");

            if (!game.InStock)
                throw new BusinessRuleException("Game is out of stock");

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.GameId == gameId);

            if (cartItem is not null)
            {
                cartItem.Quantity++;
                cartItem.UpdatedAt = DateTime.UtcNow;   
            }
            else
            {
                AddNewCartItem(userId, game);
            }

            _context.WishlistItems.Remove(wishItem);
            await _context.SaveChangeAsync();
        }

        private void AddNewCartItem(int userId, Game game)
        {
            _context.CartItems.Add(new CartItem
            {
                UserId = userId,
                GameId = game.Id,
                GameName = game.Name,
                Image = game.Image,
                Price = game.Price,
                Quantity = 1,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}