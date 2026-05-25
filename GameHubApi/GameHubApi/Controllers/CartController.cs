using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Cart;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ICurrentUserService _currentUser;
        public CartController(ICartService cartService, ICurrentUserService currentUser)
        {
            _cartService = cartService;
            _currentUser = currentUser;
        }
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.GetCartAsync(userId);
            return Ok(cart);
        }
        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            var userId = GetCurrentUserId();
            await _cartService.AddToCartAsync(userId, request.GameId, request.Quantity);
            return Ok(new { message = "Item add to cart" });
        }
        [HttpPut("{gameId}")]
        public async Task<IActionResult> UpdateQuantity(int gameId, [FromBody] UpdateQuantityRequest request)
        {
            var userId = GetCurrentUserId();
            await _cartService.UpdateQuantityAsync(userId, gameId, request.Quantity);
            {
                return Ok(new { message = "Quantity update" });
            }
        }
        [HttpDelete("{gameId}")]
        public async Task<IActionResult> ReoveFromCart(int gameId)
        {
            var userId = GetCurrentUserId();
            await _cartService.RemoveFromCartAsync(userId, gameId);
            return Ok(new { message = "Item removed from cart" });
        }
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            await _cartService.ClearCartAsync(userId);
            return Ok(new { message = "Cart cleared" });
        }

        private int GetCurrentUserId()
        {
            return _currentUser.UserId
                ?? throw new UnauthorizedAccessException(GameHub.Application.Resources.ExceptionMessages.Unauthorized);
        }
    }
}
