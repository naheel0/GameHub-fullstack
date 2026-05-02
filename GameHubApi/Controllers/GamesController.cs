using GameHub.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly IGameService _gameService;
        public GamesController(IGameService gameService)
        {
            _gameService = gameService;
        }
        [HttpGet]
        public async Task<IActionResult> GetGames(
           [FromQuery] string? genre,
           [FromQuery] string? platform,
           [FromQuery] string? _sort,
           [FromQuery] string? _order,
           [FromQuery] string? q,
           [FromQuery] int _page = 1,
           [FromQuery] int _limit = 10)
        {
            bool ascending = _order?.ToLower() != "desc";
            var result = await _gameService.GetGameAsync(genre, platform, _sort, ascending, q, _page, _limit);
            Response.Headers["X_Total_Count"] = result.TotalCount.ToString();
            return Ok(result.Items);
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
