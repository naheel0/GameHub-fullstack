using GameHub.Application.DTOs.Address;

namespace GameHub.Application.DTOs.Orders
{
    public class OrderDto
    {
        public int PurchaseId { get; set; }
        public Guid OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public AddressDto ShippingAddress { get; set; } = new();
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
