namespace GameHub.Application.DTOs.Games;

public class GameDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Rating { get; set; }
    public bool InStock { get; set; }
    public string TrailerUrl { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
    public string Description { get; set; } = string.Empty;

}