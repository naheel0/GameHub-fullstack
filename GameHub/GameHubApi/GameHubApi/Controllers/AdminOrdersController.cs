using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Admin;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly IAdminService _adminService;
        public AdminOrdersController(IAdminService adminService)
        {
            _adminService = adminService;
        }
        [HttpGet]
        public async Task<IActionResult> GetOrdder([FromQuery] AdminQueryParameters queryParams)
        {
            var q = GameHubApi.Helpers.AdminQueryBinder.FromRequest(Request, queryParams);
            var result = await _adminService.GetOrdersAsync(q);
            Response.Headers["X-Total-Count"] = result.TotalCount.ToString();
            return Ok(result.Items);
        }
        [HttpGet("{orderId:guid}")]
        public async Task<IActionResult> GetOrderDetail(Guid orderId)
        {
            var order = await _adminService.GetOrderDetailAsync(orderId);
            if (order == null) return NotFound(new { message = "Order not found" });
            return Ok(order);
        }
        [HttpPut("{orderId:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid orderId, [FromBody] UpdateOrderStatusRequest request)
        {
            await _adminService.UpdateOrderStatusAsync(orderId, request.Status);
            return Ok(new { message = "Order status update" });
        }
        [HttpDelete("{orderId:guid}")]
        public async Task<IActionResult> DeleteOrder(Guid orderId)
        {
            await _adminService.DeleteOrderAsync(orderId);
            return NoContent();
        }
    }
}
