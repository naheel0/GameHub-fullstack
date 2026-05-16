namespace GameHub.Application.DTOs.Games
{
    public class UpdateGameRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public double Rating { get; set; }
        public bool InStock { get; set; } = true;
        public string Trailer { get; set; } = string.Empty;
        public List<string> Image { get; set; } = new();
        public string Description { get; set; } = string.Empty;
    }
}
