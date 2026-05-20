using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Games;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Application.Queries.GetGames
{
    public interface IGetGamesQueryHandler
    {
        Task<ApiResponse<PagedResult<GameDto>>> HandleAsync(QueryParameters query);
    }

    public class GetGamesQueryHandler : IGetGamesQueryHandler
    {
        private readonly IApplicationDbContext _db;

        public GetGamesQueryHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<PagedResult<GameDto>>> HandleAsync(QueryParameters query)
        {
            query ??= new QueryParameters();
            query.Page = System.Math.Max(1, query.Page);
            query.PageSize = System.Math.Clamp(query.PageSize, 1, 100);

            var filtered = _db.Games.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Genre))
            {
                var g = query.Genre.ToLower();
                filtered = filtered.Where(x => x.Genre.ToLower().Contains(g));
            }

            if (!string.IsNullOrWhiteSpace(query.Platform))
            {
                var p = query.Platform.ToLower();
                filtered = filtered.Where(x => x.Platform.ToLower().Contains(p));
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.ToLower();
                filtered = filtered.Where(x => x.Name.ToLower().Contains(s) || x.Description.ToLower().Contains(s));
            }

            switch (query.SortBy?.ToLower())
            {
                case "price":
                    filtered = query.Ascending ? filtered.OrderBy(g => g.Price) : filtered.OrderByDescending(g => g.Price);
                    break;
                case "rating":
                    filtered = query.Ascending ? filtered.OrderBy(g => g.Rating) : filtered.OrderByDescending(g => g.Rating);
                    break;
                case "name":
                    filtered = query.Ascending ? filtered.OrderBy(g => g.Name) : filtered.OrderByDescending(g => g.Name);
                    break;
                default:
                    filtered = filtered.OrderBy(g => g.Name);
                    break;
            }

            var total = await filtered.CountAsync();
            var items = await filtered.Skip(query.Skip).Take(query.PageSize).ToListAsync();

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

            var paged = new PagedResult<GameDto>
            {
                Items = dtos,
                TotalCount = total,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return ApiResponse<PagedResult<GameDto>>.Ok(paged);
        }
    }
}
