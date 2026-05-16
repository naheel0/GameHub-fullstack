using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Admin;

namespace GameHub.Application.Services
{
    public interface IAdminService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        //--------------USER MANAGEMENT-----------------//
        Task<PagedResult<AdminUserListDto>> GetUsersAsync(AdminQueryParameters queryParams);
        Task<AdminUserDetailDto?> GetUserDetailAsync(int userId);
        Task BlockUserAsync(int userId);
        Task ActivateUserAsync(int userId);
        Task UpdateUserRoleAsync(int userId, string role);
        Task DeleteUserAsync(int userId);
        //-----------------ORDER MANAGEMENT------------------//
        Task<PagedResult<AdminOrderListDto>> GetOrdersAsync(AdminQueryParameters queryParams);
        Task<AdminOrderDetailDto?> GetOrderDetailAsync(Guid orderId);
        Task UpdateOrderStatusAsync(Guid orderId, string Status);
        Task DeleteOrderAsync(Guid orderId);
    }
}
