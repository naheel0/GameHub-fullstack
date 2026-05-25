namespace GameHub.Application.DTOs.Cart
{
    public class CartItemDto
    {
        public int GameId { get; set; }
        public string GameName { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
