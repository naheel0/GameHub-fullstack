using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Orders;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ICurrentUserService _currentUserService;

        public OrdersController(IOrderService orderService, ICurrentUserService currentUserService)
        {
            _orderService = orderService;
            _currentUserService = currentUserService;
        }
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            var userId = GetCurrentUserId();
            var order = await _orderService.PlaceOrderAsync(userId, request);
            return Ok(order);
        }
        
        [HttpPost("buy-now")]
        public async Task<IActionResult> BuyNow([FromBody] BuyNowRequest request)
        {
            var userId = GetCurrentUserId();
            var order = await _orderService.BuyNowAsync(userId, request);
            return Ok(order);
        }
        
        [HttpGet]
        public async Task<IActionResult> GetOrderHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userId = GetCurrentUserId();
            page = Math.Max(1, page);
            var (items, totalCount) = await _orderService.GetOrderHistoryAsync(userId, page, Math.Clamp(pageSize, 1, 100));
            Response.Headers["X-Total-Count"] = totalCount.ToString();
            return Ok(items);
        }
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrdersById(Guid orderId)
        {
            var userId = GetCurrentUserId();
            var order = await _orderService.GetOrderByIdAsync(userId, orderId);
            if (order == null) return NotFound(new { message = ExceptionMessages.OrderNotFound });
            return Ok(order);
        }

        private int GetCurrentUserId()
        {
            return _currentUserService.UserId
                ?? throw new UnauthorizedAccessException(ExceptionMessages.Unauthorized);
        }
    }
}
