using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Cart;
using GameHub.Application.Services;
using GameHub.Domain.Entities;

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
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");
            return user.CartItems.Select(c => new CartItemDto
            {
                GameId = c.GameId,
                GameName = c.GameName,
                Image = (c.Image != null && c.Image.Any()) ? c.Image.First() : string.Empty,
                Price = c.Price,
                Quantity = c.Quantity
            }).ToList();
        }
        public async Task AddToCartAsync(int userId, int gameId, int quantity)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException();
            var game = await _context.Games.FindAsync(gameId)
                ?? throw new KeyNotFoundException("Game not found");
            if (!game.InStock) throw new BusinessRuleException("Game is out of stock");
            var existing = user.CartItems.FirstOrDefault(c => c.GameId == gameId);
            if (existing != null) existing.Quantity += quantity;
            else
                user.CartItems.Add(new CartItem
                {
                    GameId = gameId,
                    GameName = game.Name,
                    Image = game.Image,
                    Price = game.Price,
                    Quantity = quantity
                });
            await _context.SaveChangeAsync();
        }
        public async Task UpdateQuantityAsync(int userId,int gameId, int quantity)
        {
            if (quantity <= 0)
                throw new BusinessRuleException("Quantity muust be least 1");
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");
            var game = await _context.Games.FindAsync(gameId)
                ?? throw new KeyNotFoundException("Game not found");
            if (!game.InStock)
                throw new BusinessRuleException("Game is currently out of stock");
            var existingItem = user.CartItems.FirstOrDefault(c => c.GameId == gameId);
            if (existingItem != null) existingItem.Quantity = quantity;
            else
            {
                user.CartItems.Add(new CartItem
                {
                    GameId = gameId,
                    GameName = game.Name,
                    Image = game.Image,
                    Price = game.Price,
                    Quantity = quantity
                });
                await _context.SaveChangeAsync();
            }
        }

        public async Task RemoveFromCartAsync(int userId, int gameid)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");
            var cartItem = user.CartItems.FirstOrDefault(c => c.GameId == gameid);
            if (cartItem == null)
                return;
            user.CartItems.Remove(cartItem);
            await _context.SaveChangeAsync();
        }
        public async Task ClearCartAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");
            user.CartItems.Clear();
            await _context.SaveChangeAsync();
        }
    }
}
