using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Games;

namespace GameHub.Application.Services
{
    public interface IGameService
    {
        Task<PagedResult<GameDto>> GetGameAsync(
            string? genre = null,
            string? platform = null,
            string? sortBy = null,
            bool ascending = true,
            string? search = null,
            int page = 1,
            int pageSize = 10);
        Task<GameDto> GetByIdAsync(int id);
    }
}
