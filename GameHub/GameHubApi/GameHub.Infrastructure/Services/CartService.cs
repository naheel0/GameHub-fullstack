using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Cart;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Infrastructure.Services
{
    public class CartService : ICartService
    {
        private readonly IApplicationDbContext _context;

        public CartService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CartItemDto>> GetCartAsync(int userId)
        {
            var items = await _context.CartItems
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return items.Select(c => new CartItemDto
            {
                GameId = c.GameId,
                GameName = c.GameName,
                Image = c.Image?.FirstOrDefault() ?? string.Empty,
                Price = c.Price,
                Quantity = c.Quantity
            }).ToList();
        }

        public async Task AddToCartAsync(int userId, int gameId, int quantity)
        {
            var game = await _context.Games.FindAsync(gameId)
                       ?? throw new NotFoundException("Game not found", "GameNotFound");

            if (!game.InStock)
                throw new BusinessRuleException("Game is out of stock", "GameOutOfStock");

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.GameId == gameId);

            if (existingItem is not null)
            {
                existingItem.Quantity += quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                AddNewCartItem(userId, game, quantity);
            }

            await _context.SaveChangeAsync();
        }

        public async Task UpdateQuantityAsync(int userId, int gameId, int quantity)
        {
            if (quantity <= 0)
                throw new BusinessRuleException("Quantity must be at least 1");

            var game = await _context.Games.FindAsync(gameId)
                       ?? throw new NotFoundException("Game not found", "GameNotFound");

            if (!game.InStock)
                throw new BusinessRuleException("Game is currently out of stock", "GameOutOfStock");

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.GameId == gameId);

            if (existingItem is not null)
            {
                existingItem.Quantity = quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {

                AddNewCartItem(userId, game, quantity);
            }

            await _context.SaveChangeAsync();
        }

        public async Task RemoveFromCartAsync(int userId, int gameId)
        {
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.GameId == gameId);

            if (cartItem is null)
                return;

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangeAsync();
        }

        public async Task ClearCartAsync(int userId)
        {

            await _context.CartItems
                .Where(c => c.UserId == userId)
                .ExecuteDeleteAsync();
        }

        private void AddNewCartItem(int userId, Game game, int quantity)
        {
            _context.CartItems.Add(new CartItem
            {
                UserId = userId,
                GameId = game.Id,
                GameName = game.Name,
                Image = game.Image,
                Price = game.Price,
                Quantity = quantity,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}