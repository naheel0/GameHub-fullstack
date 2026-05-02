namespace GameHub.Domain.Entities
{
    public class Game
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal Rating { get; set; }
        public bool InStock { get; set; } = true;
        public string Description { get; set; } = string.Empty;
        public string Trailer { get; set; } = string.Empty;
        public List<string> Image { get; set; } = new();
    }
}
