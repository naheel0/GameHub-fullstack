using GameHub.Application.DTOs.Orders;

namespace GameHub.Application.Services
{
    public interface IOrderService
    {
        Task<OrderDto> PlaceOrderAsync(int userId, PlaceOrderRequest request);
        Task<OrderDto> BuyNowAsync(int userId, BuyNowRequest request);
        Task<List<OrderDto>> GetOrderHistoryAsync(int userId);
        Task<OrderDto?> GetOrderByIdAsync(int userId, Guid orderId);
    }
}
