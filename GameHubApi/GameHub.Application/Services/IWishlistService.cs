using GameHub.Application.DTOs.Wishlist;

namespace GameHub.Application.Services
{
    public interface IWishlistService
    {
        Task<List<WishlistItemDto>> GetWishlistItemsAsync(int userId);
        Task AddToWishlistAsync(int userId, int gameId);
        Task RemoveFromWishlistAsync(int userId, int gameId);
        Task MoveToCartAsync(int userId, int gameId);
    }
}
