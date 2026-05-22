using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Admin;
using GameHub.Application.DTOs.Orders;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using GameHub.Infrastructure.Data;
using GameHub.Infrastructure.Extensions;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace GameHub.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly IApplicationDbContext _context;
        public AdminService(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var totalProducts = await _context.Games.CountAsync();
            var totalUsers = await _context.Users.CountAsync();
            var totalOrders = await _context.Purchases.CountAsync();
            var totalRevenue = await _context.Purchases.SumAsync(p => p.Total);

            var statusCountsRaw = await _context.Purchases
                .GroupBy(p => p.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                }).ToListAsync();
            var statusCounts = statusCountsRaw
                .Select(s => new OrderStatusCount
                {
                    Status = s.Status.ToString(),
                    Count = s.Count
                })
                .ToList();
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            var dailySales = await _context.Purchases
                .Where(p => p.OrderDate >= sevenDaysAgo)
                .GroupBy(p => p.OrderDate.Date)
                .Select(g => new DailySales
                {
                    Date = g.Key,
                    Amount = g.Sum(p => p.Total)
                }).OrderBy(d => d.Date)
                .ToListAsync();
            return new DashboardStatsDto
            {
                TotalProducts = totalProducts,
                TotalUsers = totalUsers,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                OrderStatusDistribution = statusCounts,
                Last7DaysSales = dailySales

            };
        }
        //-------------------------USER MANAGEMENT----------------------------------//
        public async Task<PagedResult<AdminUserListDto>> GetUsersAsync(AdminQueryParameters queryParams)
        {
            var query = _context.Users.AsNoTracking().AsQueryable();
            query = query.ApplyAdminUserQuery(queryParams);
            var TotalCount = await query.CountAsync();
            var user = await query
                .Skip(queryParams.Skip)
                .Take(queryParams.PageSize)
                .Select(u => new AdminUserListDto
                {
                    Id = u.Id,
                    FullName = u.FirstName + " " + u.LastName,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    Status = u.AccountStatus.ToString(),
                    CreatedAt = u.CreatedAt,
                }).ToListAsync();
            return new PagedResult<AdminUserListDto>
            {
                Items = user,
                TotalCount = TotalCount,
                Page = queryParams.Page,
                PageSize = queryParams.PageSize,
            };
        }
        public async Task<AdminUserDetailDto?> GetUserDetailAsync(int userId)
        {
            var appDb = _context as AppDbContext;
            if (appDb == null) throw new InvalidOperationException(ExceptionMessages.DatabaseConnectionUnavailable);
            var results = await appDb.Database
                .SqlQueryRaw<AdminUserDetailDto>("EXEC GetUserDetail @UserId", new SqlParameter("@UserId", userId))
                .ToListAsync();

            return results.FirstOrDefault();
        }
        public async Task BlockUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                 ?? throw new NotFoundException(nameof(ExceptionMessages.UserNotFound));
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"EXEC BlockUser @UserId={userId}");
        }
        public async Task ActivateUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException(ExceptionMessages.UserNotFound);
            user.AccountStatus = Domain.Enums.AccountStatus.Active;
            await _context.SaveChangeAsync();
        }
        public async Task UpdateUserRoleAsync(int userId, string role)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException(nameof(ExceptionMessages.UserNotFound));
            if (!Enum.TryParse<Domain.Enums.Role>(role, true, out var parsedRole))
                throw new BusinessRuleException(nameof(ExceptionMessages.InvalidRole));
            user.Role = parsedRole;
            await _context.SaveChangeAsync();
        }
        public async Task DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException(nameof(ExceptionMessages.UserNotFound));
            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangeAsync();
        }
        //----------------------ORDER MANAGEMENT-------------------------//
        public async Task<PagedResult<AdminOrderListDto>> GetOrdersAsync(AdminQueryParameters queryParams)
        {
            var query = _context.Purchases
                .Include(p => p.user)
                .AsNoTracking()
                .AsQueryable();

            query = query.ApplyAdminOrderQuery(queryParams);
            var totalCount = await query.CountAsync();

            var items = await query
                .Skip(queryParams.Skip)
                .Take(queryParams.PageSize)
                .Select(p => new AdminOrderListDto
                {
                    OrderId = p.OrderId,
                    CustomerName = p.user.FirstName + " " + p.user.LastName,
                    CustomerEmail = p.user.Email,
                    Total = p.Total,
                    Status = p.Status.ToString(),
                    OrderDate = p.OrderDate
                }).ToListAsync();
            return new PagedResult<AdminOrderListDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = queryParams.Page,
                PageSize = queryParams.PageSize
            };
        }
        public async Task<AdminOrderDetailDto?> GetOrderDetailAsync(Guid orderId)
        {
            var purchase = await _context.Purchases
                .Include(p => p.user)
                .Include(p => p.Items)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.OrderId == orderId);

            if (purchase == null) return null;

            var address = purchase.ShippingAddress;

            return new AdminOrderDetailDto
            {
                OrderId = purchase.OrderId,
                CustomerName = purchase.user.FirstName + " " + purchase.user.LastName,
                CustomerEmail = purchase.user.Email,
                SubTotal = purchase.SubTotal,
                Tax = purchase.Tax,
                Total = purchase.Total,
                Status = purchase.Status.ToString(),
                PaymentMethod = purchase.PaymentMethod.ToString(),
                OrderDate = purchase.OrderDate,
                Items = purchase.Items.Select(i => new OrderItemDto
                {
                    GameId = i.GameId,
                    GameName = i.GameName,
                    Price = i.Price,
                    Quantity = i.Quantity
                }).ToList(),
                ShippingAddress = new AdminShippingAddressDto
                {
                    FullName = address.FullName,
                    AddressLine1 = address.AddressLine1,
                    AddressLine2 = address.AddressLine2,
                    Country = address.Country,
                    City = address.City,
                    State = address.State,
                    ZipCode = address.ZipCode,
                    Phone = address.Phone
                }
            };
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, string newStatus)
        {
            var purchase = await _context.Purchases.FirstOrDefaultAsync(p => p.OrderId == orderId)
                ?? throw new NotFoundException(nameof(ExceptionMessages.OrderNotFound));

            if (!Enum.TryParse<Domain.Enums.OrderStatus>(newStatus, true, out var parsedStatus))
                throw new BusinessRuleException(nameof(ExceptionMessages.InvalidOrderStatus));

            purchase.Status = parsedStatus;
            await _context.SaveChangeAsync();
        }

        public async Task DeleteOrderAsync(Guid orderId)
        {
            var purchase = await _context.Purchases.FirstOrDefaultAsync(p => p.OrderId == orderId)
                ?? throw new NotFoundException(nameof(ExceptionMessages.OrderNotFound));

            _context.Purchases.Remove(purchase);
            await _context.SaveChangeAsync();
        }

    }
}
