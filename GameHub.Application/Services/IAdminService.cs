using GameHub.Application.DTOs.Admin;

namespace GameHub.Application.Services
{
    public interface IAdminService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
