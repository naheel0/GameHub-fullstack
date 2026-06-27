namespace GameHub.Application.DTOs.Orders
{
    public class BuyNowRequest
    {
        public int GameId { get; set; }
        public int Quantity { get; set; } = 1;
        public Guid AddressId { get; set; }
    }
}