namespace GameHub.Application.DTOs.Cart
{
    public class AddToCartRequest
    {
        public int GameId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
