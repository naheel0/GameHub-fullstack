using GameHub.Application.DTOs.Orders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameHub.Application.Services
{
    public interface IOrderService
    {
        Task<OrderDto> PlaceOrderAsync(int userId, PlaceOrderRequest request);
        Task<List<OrderDto>> GetOrderHistoryAsync(int userId);
        Task<OrderDto> GetOrderByIdAsync(int userId, Guid orderId);
    }
}
