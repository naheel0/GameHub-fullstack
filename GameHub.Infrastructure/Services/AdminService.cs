using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Admin;
using GameHub.Application.Services;
using Microsoft.EntityFrameworkCore;

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
    }
}
