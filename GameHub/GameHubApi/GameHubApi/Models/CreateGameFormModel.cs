namespace GameHub.Api.Models
{
    public class CreateGameFormModel
    {
        public string Name { get; set; } = null!;
        public string Genre { get; set; } = null!;
        public string Platform { get; set; } = null!;
        public decimal Price { get; set; }
        public double Rating { get; set; }
        public bool InStock { get; set; }
        public IFormFile? TrailerFile { get; set; }
        public string? ExistingTrailer { get; set; }
        public string Description { get; set; } = null!;
        public List<IFormFile>? ImageFiles { get; set; }
        public List<string>? ExistingImages { get; set; }
    }
}
