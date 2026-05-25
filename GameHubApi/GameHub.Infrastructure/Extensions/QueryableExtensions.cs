using GameHub.Application.Common.Models;
using GameHub.Domain.Entities;

namespace GameHub.Infrastructure.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<Game> ApplyQueryParameters(this IQueryable<Game> query, QueryParameters options)
        {
            if (options == null) return query;

            if (!string.IsNullOrWhiteSpace(options.Genre))
            {
                var g = options.Genre.ToLower();
                query = query.Where(x => x.Genre.ToLower().Contains(g));
            }

            if (!string.IsNullOrWhiteSpace(options.Platform))
            {
                var p = options.Platform.ToLower();
                query = query.Where(x => x.Platform.ToLower().Contains(p));
            }

            if (!string.IsNullOrWhiteSpace(options.Search))
            {
                var s = options.Search.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(s) || x.Description.ToLower().Contains(s));
            }

            switch (options.SortBy?.ToLower())
            {
                case QueryParametersConstants.SortByPrice:
                    query = options.Ascending ? query.OrderBy(g => g.Price) : query.OrderByDescending(g => g.Price);
                    break;
                case QueryParametersConstants.SortByRating:
                    query = options.Ascending ? query.OrderBy(g => g.Rating) : query.OrderByDescending(g => g.Rating);
                    break;
                case QueryParametersConstants.SortByName:
                    query = options.Ascending ? query.OrderBy(g => g.Name) : query.OrderByDescending(g => g.Name);
                    break;
                default:
                    query = query.OrderBy(g => g.Name);
                    break;
            }

            return query;
        }
    }
}
