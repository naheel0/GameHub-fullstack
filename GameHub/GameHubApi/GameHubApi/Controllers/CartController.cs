using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Cart;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
            var cart = await _cartService.GetCartAsync(_currentUser.UserId!.Value);
            return Ok(cart);
        }
        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            await _cartService.AddToCartAsync(_currentUser.UserId!.Value, request.GameId, request.Quantity);
            return Ok(new { message = "Item add to cart" });
        }
        [HttpPut("{gameId}")]
        public async Task<IActionResult> UpdateQuantity(int gameId, [FromBody] UpdateQuantityRequest request)
        {
            await _cartService.UpdateQuantityAsync(_currentUser.UserId!.Value, gameId, request.Quantity);
            {
                return Ok(new { message = "Quantity update" });
            }
        }
        [HttpDelete("{gameId}")]
        public async Task<IActionResult> ReoveFromCart(int gameId)
        {
            await _cartService.RemoveFromCartAsync(_currentUser.UserId!.Value, gameId);
            return Ok(new { message = "Item removed from cart" });
        }
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            await _cartService.ClearCartAsync(_currentUser.UserId!.Value);
            return Ok(new { message = "Cart cleared" });
        }
    }
}
