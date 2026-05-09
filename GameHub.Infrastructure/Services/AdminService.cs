using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Models;
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
        //-------------------------USER MANAGEMENT----------------------------------//
        public async Task<PagedResult<AdminUserListDto>> GetUsersAsync (QueryParameters queryParams)
        {
            var query=_context.Users.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(queryParams.Search))
            {
                var term=queryParams.Search.ToLower();
                query = query.Where(u =>
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term));
            }
            var TotalCount=await query.CountAsync();
            var user=await query
                .OrderByDescending(u=>u.CreatedAt)
                .Skip(queryParams.Skip)
                .Take(queryParams.PageSize)
                .Select(u=>new AdminUserListDto
                {
                    Id= u.Id,
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
        public async Task<AdminUserDetailDto> GetUserDetailAsync(int userId)
        {
            var user =await _context.Users
                .AsNoTracking()
                .Include(u=>u.Addresses)
                .Include(u=>u.PurchaseHistory)
                .FirstOrDefaultAsync(u=>u.Id==userId);
            if (user == null) return null;
            return new AdminUserDetailDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                Status = user.AccountStatus.ToString(),
                AddressCount = user.Addresses.Count,
                OrderCount = user.PurchaseHistory.Count,
                TotalSpent = user.PurchaseHistory.Sum(p => p.Total)
            };
        }
        public async Task BlockUserAsync (int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException("User not found");
            user.AccountStatus = Domain.Enums.AccountStatus.Blocked;
            await _context.SaveChangeAsync();
        }
        public async Task ActivateUserAsync (int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException("User not found");
            user.AccountStatus = Domain.Enums.AccountStatus.Active;
            await _context.SaveChangeAsync();
        }
        public async Task UpdateUserRoleAsync(int userId, string role)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException("User not found");
            if (!Enum.TryParse<Domain.Enums.Role>(role, true, out var parsedRole))
                throw new BusinessRuleException("Invalid role. Allowed values: Admin or User.");
            user.Role= parsedRole;
            await _context.SaveChangeAsync();
        }
        public async Task DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException("user not found");
            _context.Users.Remove(user);
            await _context.SaveChangeAsync();
        }
    }
}
