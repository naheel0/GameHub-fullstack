using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Cart;
using GameHub.Application.DTOs.Wishlist;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameHub.Infrastructure.Services
{
    public class WishlistService:IWishlistService
    {
        private readonly IApplicationDbContext _context;
        public WishlistService(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<List<WishlistItemDto>> GetWishlistItemsAsync (int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException("User not found");
            return user.WishlistItems.Select(w => new WishlistItemDto
            {
               GameId = w.GameId,
               GameName = w.GameName,
               Image= w.ImageUrl,
               Price = w.Price,
            }).ToList();
        }
        public async Task AddToWishlistAsync(int userId,int gameId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");
            var game = await _context.Games.FindAsync(gameId)
                ?? throw new KeyNotFoundException("Game not found");
            if (user.WishlistItems.Any(w => w.GameId == gameId))
                return;
            user.WishlistItems.Add(new Domain.Entities.WishlistItem
            {
                GameId = gameId,
                GameName = game.Name,
                ImageUrl = game.Image.FirstOrDefault() ?? string.Empty,
                Price= game.Price,
            });
            await _context.SaveChangeAsync();
        }
        public async Task RemoveFromWishlistAsync(int userId, int gameId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("user not found");
            var item = user.WishlistItems.FirstOrDefault(w => w.GameId == gameId);
            if(item != null)
            {
                user.WishlistItems.Remove(item);
                await _context.SaveChangeAsync();
            }
        }
        public async Task MoveToCartAsync(int userId, int gameId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");
            var wishItem = user.WishlistItems.FirstOrDefault(w => w.GameId == gameId)
                ?? throw new KeyNotFoundException("Item not found in wishlist");
            var game = await _context.Games.FindAsync(gameId)
                ?? throw new KeyNotFoundException("Game not found");
            if (!game.InStock)
                throw new BusinessRuleException("Game is out of stock");
            var cartItem=user.CartItems.FirstOrDefault(c=>c.GameId == gameId);
            if (cartItem != null)
                cartItem.Quantity++;
            else
                user.CartItems.Add(new CartItem {
                    GameId = gameId,
                    GameName = game.Name,
                    Image = game.Image,
                    Price = game.Price,
                    Quantity = 1
                });
            user.WishlistItems.Remove(wishItem);
            await _context.SaveChangeAsync();
        }
    }
}
