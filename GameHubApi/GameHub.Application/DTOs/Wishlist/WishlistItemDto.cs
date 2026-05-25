namespace GameHub.Application.DTOs.Wishlist
{
    public class WishlistItemDto
    {
        public int GameId { get; set; }
        public string GameName { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
