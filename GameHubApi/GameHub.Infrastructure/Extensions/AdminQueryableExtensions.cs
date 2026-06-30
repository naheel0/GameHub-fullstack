using GameHub.Application.Common.Models;
using GameHub.Domain.Entities;

namespace GameHub.Infrastructure.Extensions
{
    public static class AdminQueryableExtensions
    {
        public static IQueryable<User> ApplyAdminUserQuery(this IQueryable<User> query, AdminQueryParameters options)
        {
            if (options == null) return query;

            if (!string.IsNullOrWhiteSpace(options.Status))
            {
                if (Enum.TryParse<Domain.Enums.AccountStatus>(options.Status, true, out var parsedStatus))
                {
                    query = query.Where(u => u.AccountStatus == parsedStatus);
                }
            }
            if (!string.IsNullOrWhiteSpace(options.Role))
            {
                if (Enum.TryParse<Domain.Enums.Role>(options.Role, true, out var parsedRole))
                {
                    query = query.Where(u => u.Role == parsedRole);
                }
            }
            if (options.FromDate.HasValue)
                query = query.Where(u => u.CreatedAt >= options.FromDate.Value);
            if (options.ToDate.HasValue)
                query = query.Where(u => u.CreatedAt <= options.ToDate.Value);

            if (!string.IsNullOrWhiteSpace(options.Search))
            {
                var term = options.Search.ToLower();
                query = query.Where(u =>
                    (u.FirstName ?? string.Empty).ToLower().Contains(term) ||
                    (u.LastName ?? string.Empty).ToLower().Contains(term) ||
                    (u.Email ?? string.Empty).ToLower().Contains(term));
            }

            switch (options.SortBy?.ToLower())
            {
                case "name":
                    query = options.Ascending ? query.OrderBy(u => u.FirstName).ThenBy(u => u.LastName) : query.OrderByDescending(u => u.FirstName).ThenByDescending(u => u.LastName);
                    break;
                case "email":
                    query = options.Ascending ? query.OrderBy(u => u.Email) : query.OrderByDescending(u => u.Email);
                    break;
                case "role":
                    query = options.Ascending ? query.OrderBy(u => u.Role) : query.OrderByDescending(u => u.Role);
                    break;
                case "status":
                    query = options.Ascending ? query.OrderBy(u => u.AccountStatus) : query.OrderByDescending(u => u.AccountStatus);
                    break;
                case "createdat":
                case "created_at":
                case "created":
                    query = options.Ascending ? query.OrderBy(u => u.CreatedAt) : query.OrderByDescending(u => u.CreatedAt);
                    break;
                default:
                    query = query.OrderByDescending(u => u.CreatedAt);
                    break;
            }

            return query;
        }

        public static IQueryable<Purchase> ApplyAdminOrderQuery(this IQueryable<Purchase> query, AdminQueryParameters options)
        {
            if (options == null) return query;

            if (!string.IsNullOrWhiteSpace(options.Status))
            {
                if (Enum.TryParse<Domain.Enums.OrderStatus>(options.Status, true, out var parsedStatus))
                {
                    query = query.Where(p => p.Status == parsedStatus);
                }
            }
            if (options.FromDate.HasValue)
                query = query.Where(p => p.OrderDate >= options.FromDate.Value);
            if (options.ToDate.HasValue)
                query = query.Where(p => p.OrderDate <= options.ToDate.Value);

            if (!string.IsNullOrWhiteSpace(options.Search))
            {
                var term = options.Search.ToLower();
                query = query.Where(p =>
                    p.OrderId.ToString().ToLower().Contains(term) ||
                    (p.user.FirstName ?? string.Empty).ToLower().Contains(term) ||
                    (p.user.LastName ?? string.Empty).ToLower().Contains(term) ||
                    (p.user.Email ?? string.Empty).ToLower().Contains(term));
            }

            switch (options.SortBy?.ToLower())
            {
                case "orderdate":
                case "order_date":
                case "date":
                    query = options.Ascending ? query.OrderBy(p => p.OrderDate) : query.OrderByDescending(p => p.OrderDate);
                    break;
                case "total":
                    query = options.Ascending ? query.OrderBy(p => p.Total) : query.OrderByDescending(p => p.Total);
                    break;
                case "status":
                    query = options.Ascending ? query.OrderBy(p => p.Status) : query.OrderByDescending(p => p.Status);
                    break;
                case "orderid":
                case "order_id":
                    query = options.Ascending ? query.OrderBy(p => p.OrderId) : query.OrderByDescending(p => p.OrderId);
                    break;
                case "customer":
                case "customername":
                case "customer_name":
                    query = options.Ascending ? query.OrderBy(p => p.user.FirstName).ThenBy(p => p.user.LastName) : query.OrderByDescending(p => p.user.FirstName).ThenByDescending(p => p.user.LastName);
                    break;
                default:
                    query = query.OrderByDescending(p => p.OrderDate);
                    break;
            }

            return query;
        }
    }
}
