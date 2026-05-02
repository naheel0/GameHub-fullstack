using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Games;
using GameHub.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Infrastructure.Services
{
    public class GameService : IGameService
    {
        private readonly IApplicationDbContext _context;
        public GameService(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<PagedResult<GameDto>> GetGameAsync(
            string? genre = null,
            string? platform = null,
            string? sortBy = null,
            bool ascending = true,
            string? search = null,
            int page = 1,
            int pageSize = 10)
        {
            var query = _context.Games.AsNoTracking().Where(g => true);// placeholder for soft delete later
            if (!string.IsNullOrWhiteSpace(genre))
                query = query.Where(g => g.Genre.ToLower() == genre.ToLower());
            if (!string.IsNullOrWhiteSpace(platform))
                query = query.Where(g => g.Platform.ToLower() == platform.ToLower());
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(g => g.Name.ToLower().Contains(term) || g.Description.ToLower().Contains(term));
            }
            //-----------SORTING-------------
            query = (sortBy?.ToLower(), ascending) switch
            {
                ("price", true) => query.OrderBy(g => g.Price),
                ("price", false) => query.OrderByDescending(g => g.Price),
                ("rating", true) => query.OrderBy(g => g.Rating),
                ("rating", false) => query.OrderByDescending(g => g.Rating),
                ("name", false) => query.OrderByDescending(g => g.Name),
                _ => query.OrderBy(g => g.Name)

            };
            var totalCount = await query.CountAsync();
            var item = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = item.Select(g => new GameDto
            {
                Id = g.Id,
                Name = g.Name,
                Genre = g.Genre,
                Platform = g.Platform,
                Price = g.Price,
                Rating = (double)g.Rating,
                InStock = g.InStock,
                TrailerUrl = g.Trailer,
                ImageUrls = g.Image,
                Description = g.Description,
            }).ToList();
            return new PagedResult<GameDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
            };
        }
        public async Task<GameDto> GetGameAsync(int id)
        {
            var game = await _context.Games.AsNoTracking().FirstOrDefaultAsync(g => g.Id == id);
            if (game == null)
                throw new KeyNotFoundException($"Game with id {id} not found.");

            return new GameDto
            {
                Id = game.Id,
                Name = game.Name,
                Genre = game.Genre,
                Platform = game.Platform,
                Price = game.Price,
                Rating = (double)game.Rating,
                InStock = game.InStock,
                TrailerUrl = game.Trailer,
                ImageUrls = game.Image,
                Description = game.Description,
            };
        }
        public Task<GameDto> GetByIdAsync(int id)
        {
            return GetGameAsync(id);
        }
    }
}
