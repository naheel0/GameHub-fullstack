using System;
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
            int page = Math.Max(1, _page);
            int limit = Math.Clamp(_limit, 1, 100);
            bool ascending = _order?.ToLower() != "desc";

            var result = await _gameService.GetGameAsync(genre, platform, _sort, ascending, q, page, limit);

            Response.Headers["X-Total-Count"] = result.TotalCount.ToString();

            // Return full paged wrapper (Items + metadata) to make clients independent of headers
            return Ok(result);
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
