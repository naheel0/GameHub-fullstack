namespace GameHub.Application.DTOs.Orders
{
    public class PlaceOrderRequest
    {
        public Guid AddressId { get; set; }
        public string PaymentMethod { get; set; } = "COD";
    }
}
