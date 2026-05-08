using GameHub.Application.Common.Models;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly IGameService _gameService;
        private readonly GameHub.Application.Queries.GetGames.IGetGamesQueryHandler _getGamesHandler;

        public GamesController(IGameService gameService, GameHub.Application.Queries.GetGames.IGetGamesQueryHandler getGamesHandler)
        {
            _gameService = gameService;
            _getGamesHandler = getGamesHandler;
        }
        [HttpGet]
        public async Task<IActionResult> GetGames([FromQuery] QueryParameters query)
        {
            var qParams = query ?? new QueryParameters();

            // Map underscored keys that don't map automatically to properties
            if (Request.Query.TryGetValue("_sort", out var s)) qParams.SortBy = s;
            if (Request.Query.TryGetValue("_order", out var o)) qParams.SortOrder = o;
            if (Request.Query.TryGetValue("q", out var qq)) qParams.Search = qq;
            if (Request.Query.TryGetValue("_page", out var p) && int.TryParse(p, out var pi)) qParams.Page = pi;
            if (Request.Query.TryGetValue("_limit", out var l) && int.TryParse(l, out var li)) qParams.PageSize = li;

            qParams.Page = Math.Max(1, qParams.Page);
            qParams.PageSize = Math.Clamp(qParams.PageSize, 1, 100);

            var response = await _getGamesHandler.HandleAsync(qParams);

            Response.Headers["X-Total-Count"] = response.Data?.TotalCount.ToString() ?? "0";

            return StatusCode(response.StatusCode, response);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var game = await _gameService.GetByIdAsync(id);
            if (game == null) return NotFound(new { message = "Game not found" });
            return Ok(game);
        }
    }
}
