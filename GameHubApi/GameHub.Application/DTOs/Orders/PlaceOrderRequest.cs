namespace GameHub.Application.DTOs.Orders
{
    using GameHub.Domain.Enums;

    public class PlaceOrderRequest
    {
        public Guid AddressId { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Razorpay;
    }
}
