using GameHub.Application.DTOs.Cart;

namespace GameHub.Application.Services
{
    public interface ICartService
    {
        Task<List<CartItemDto>> GetCartAsync(int userID);
        Task AddToCartAsync(int userId, int gameId, int quantity = 1);
        Task UpdateQuantityAsync(int userId, int gameId, int quantity);
        Task RemoveFromCartAsync(int userId, int gameId);
        Task ClearCartAsync(int userId);

    }
}
