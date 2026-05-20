using GameHub.Domain.Enums;

namespace GameHub.Domain.Entities
{
    public class Purchase
    {
        public Guid OrderId { get; set; } = Guid.NewGuid();
        public int UserId { get; set; }
        public int Id { get; set; }
        public User user { get; set; } = null;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public List<OrderItem> Items { get; set; } = new();
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public PurchaseShippingAddress ShippingAddress { get; set; } = new();
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Razorpay;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public Payment? Payment { get; set; }
    }
}
