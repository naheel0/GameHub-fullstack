using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Games;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using GameHub.Infrastructure.Extensions;
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
        public async Task<PagedResult<GameDto>> GetGameAsync(QueryParameters options)
        {
            options ??= new QueryParameters();
            options.Page = Math.Max(1, options.Page);
            options.PageSize = Math.Clamp(options.PageSize, 1, 100);

            var query = _context.Games.AsNoTracking().Where(g => true);
            query = query.ApplyQueryParameters(options);

            var totalCount = await query.CountAsync();
            var items = await query.Skip(options.Skip).Take(options.PageSize).ToListAsync();

            var dtos = items.Select(g => new GameDto
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
                Page = options.Page,
                PageSize = options.PageSize,
            };
        }

        public Task<PagedResult<GameDto>> GetGameAsync(
            string? genre = null,
            string? platform = null,
            string? sortBy = null,
            bool ascending = true,
            string? search = null,
            int page = 1,
            int pageSize = 10)
        {
            var options = new QueryParameters
            {
                Genre = genre,
                Platform = platform,
                SortBy = sortBy,
                SortOrder = ascending ? "asc" : "desc",
                Search = search,
                Page = page,
                PageSize = pageSize
            };
            return GetGameAsync(options);
        }
        public async Task<GameDto> GetGameAsync(int id)
        {
            var game = await _context.Games.AsNoTracking().FirstOrDefaultAsync(g => g.Id == id);
            if (game == null)
                throw new NotFoundException($"Game with id {id} not found.", "GameNotFoundById", id);

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
        //-----------------------------------ADMIN------------------------------------//
        public async Task<GameDto> CreateGameAsync(CreateGameRequest request)
        {
            var game = new Game
            {
                Name = request.Name,
                Genre = request.Genre,
                Platform = request.Platform,
                Price = request.Price,
                Rating = (decimal)request.Rating,
                InStock = request.InStock,
                Trailer = request.Trailer,
                Image = request.Image,
                Description = request.Description
            };
            _context.Games.Add(game);
            await _context.SaveChangeAsync();
            return MapToDto(game);
        }
        public async Task<GameDto> UpdateGameAsync(int id, UpdateGameRequest request)
        {
            var game = await _context.Games.FindAsync(id)
                ?? throw new NotFoundException(nameof(ExceptionMessages.GameNotFound));
            game.Name = request.Name;
            game.Genre = request.Genre;
            game.Platform = request.Platform;
            game.InStock = request.InStock;
            game.Price = request.Price;
            game.Trailer = request.Trailer;
            game.Image = request.Image;
            game.Description = request.Description;
            await _context.SaveChangeAsync();
            return MapToDto(game);
        }
        public async Task<GameDto> DeleteGameAsync(int id)
        {
            var game = await _context.Games.FindAsync(id)
                ?? throw new NotFoundException(nameof(ExceptionMessages.GameNotFound));
            game.IsDeleted = true;
            game.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangeAsync();
            return MapToDto(game);
        }
        private static GameDto MapToDto(Game g) => new()
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
            Description = g.Description
        };
    }
}
