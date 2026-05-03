using GameHub.Application.Common.interfaces;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
            var wishlist = await _wishlistService.GetWishlistItemsAsync(_currentUser.UserId!.Value);
            return Ok(wishlist);
        }
        [HttpPost("{gameId}")]
        public async Task<IActionResult> AddToWishlist(int gameId)
        {
            await _wishlistService.AddToWishlistAsync(_currentUser.UserId!.Value, gameId);
            return Ok(new {meesage="Add to wishlist"});
        }
        [HttpDelete("{gameId}")]
        public async Task<IActionResult> RemoveFromWishlist(int gameId)
        {
            await _wishlistService.RemoveFromWishlistAsync(_currentUser.UserId!.Value, gameId);
            return Ok(new {message="Removed from wishlist"});
        }
        [HttpPost("{gameId}/move-to-cart")]
        public async Task<IActionResult> MoveToCart(int gameId)
        {
            await _wishlistService.MoveToCartAsync(_currentUser.UserId!.Value, gameId);
            return Ok(new { message = "Moved to cart" });
        }
    }
}
