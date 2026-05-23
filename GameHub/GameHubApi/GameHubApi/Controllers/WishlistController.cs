using GameHub.Application.Common.interfaces;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;
        private readonly ICurrentUserService _currentUser;
        public WishlistController(IWishlistService wishlistService, ICurrentUserService currentUser)
        {
            _wishlistService = wishlistService;
            _currentUser = currentUser;
        }
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetCurrentUserId();
            var wishlist = await _wishlistService.GetWishlistItemsAsync(userId);
            return Ok(wishlist);
        }
        [HttpPost("{gameId}")]
        public async Task<IActionResult> AddToWishlist(int gameId)
        {
            var userId = GetCurrentUserId();
            await _wishlistService.AddToWishlistAsync(userId, gameId);
            return Ok(new { meesage = "Add to wishlist" });
        }
        [HttpDelete("{gameId}")]
        public async Task<IActionResult> RemoveFromWishlist(int gameId)
        {
            var userId = GetCurrentUserId();
            await _wishlistService.RemoveFromWishlistAsync(userId, gameId);
            return Ok(new { message = "Removed from wishlist" });
        }
        [HttpPost("{gameId}/move-to-cart")]
        public async Task<IActionResult> MoveToCart(int gameId)
        {
            var userId = GetCurrentUserId();
            await _wishlistService.MoveToCartAsync(userId, gameId);
            return Ok(new { message = "Moved to cart" });
        }

        private int GetCurrentUserId()
        {
            return _currentUser.UserId
                ?? throw new UnauthorizedAccessException(GameHub.Application.Resources.ExceptionMessages.Unauthorized);
        }
    }
}
