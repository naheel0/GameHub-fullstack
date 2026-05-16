using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Orders;
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
            var order = await _orderService.PlaceOrderAsync(_currentUserService.UserId!.Value, request);
            return Ok(order);
        }
        [HttpGet]
        public async Task<IActionResult> GetOrderHistory()
        {
            var order = await _orderService.GetOrderHistoryAsync(_currentUserService.UserId!.Value);
            return Ok(order);
        }
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrdersById(Guid orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(_currentUserService.UserId!.Value, orderId);
            if (order == null) return NotFound(new { message = "Order not found" });
            return Ok(order);
        }
    }
}
