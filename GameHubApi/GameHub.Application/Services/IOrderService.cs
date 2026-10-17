using GameHub.Application.DTOs.Orders;

namespace GameHub.Application.Services
{
    public interface IOrderService
    {
        Task<OrderDto> PlaceOrderAsync(int userId, PlaceOrderRequest request);
        Task<OrderDto> BuyNowAsync(int userId, BuyNowRequest request);
        Task<(List<OrderDto> Items, int TotalCount)> GetOrderHistoryAsync(int userId, int page, int pageSize);
        Task<OrderDto?> GetOrderByIdAsync(int userId, Guid orderId);
    }
}
