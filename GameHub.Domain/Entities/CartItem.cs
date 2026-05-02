namespace GameHub.Domain.Entities
{
    public class CartItem
    {
        public int GameId { get; set; }
        public int Quantity { get; set; }
        public string GameName { get; set; } = string.Empty;
        public List<string> Image { get; set; } = new();
        public decimal Price { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
