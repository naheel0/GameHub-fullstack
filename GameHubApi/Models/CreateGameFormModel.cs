using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

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
        public string? TrailerUrl { get; set; }
        public string Description { get; set; } = null!;
        public List<IFormFile>? ImageFiles { get; set; }
    }
}
