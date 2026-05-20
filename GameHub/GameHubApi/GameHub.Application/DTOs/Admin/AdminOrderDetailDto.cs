using GameHub.Application.DTOs.Orders;

namespace GameHub.Application.DTOs.Admin
{
    public class AdminOrderDetailDto
    {
        public Guid OrderId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public AdminShippingAddressDto ShippingAddress { get; set; } = new();
    }
}
