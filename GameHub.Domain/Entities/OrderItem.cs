namespace GameHub.Domain.Entities
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int PurchaseId { get; set; }
        public Purchase Purchase { get; set; } = null!;
        public int GameId { get; set; }
        public string GameName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
