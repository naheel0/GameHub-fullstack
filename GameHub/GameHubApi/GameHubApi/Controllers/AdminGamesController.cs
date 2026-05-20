using GameHub.Api.Models;
using GameHub.Application.Common.Interfaces;
using GameHub.Application.DTOs.Games;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHub.Api.Controllers
{

    [ApiController]
    [Route("api/admin/games")]
    [Authorize(Roles = "Admin")]
    public class AdminGamesController : ControllerBase
    {
        private readonly IGameService _gameService;
        private readonly IFileStorageService _storage;

        public AdminGamesController(IGameService gameService, IFileStorageService storage)
        {
            _gameService = gameService;
            _storage = storage;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateGame([FromForm] CreateGameFormModel model)
        {
            // Upload images
            List<string> imageUrls = new();
            if (model.ImageFiles != null)
            {
                try
                {
                    foreach (var file in model.ImageFiles)
                    {
                        var url = await _storage.UploadImageAsync(file);
                        imageUrls.Add(url);
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(502, new { error = "Image upload failed", message = ex.Message });
                }
            }

            string trailer = "";
            if (model.TrailerFile != null)
            {
                try
                {
                    trailer = await _storage.UploadVideoAsync(model.TrailerFile);
                }
                catch (Exception ex)
                {
                    return StatusCode(502, new { error = "Trailer upload failed", message = ex.Message });
                }
            }

            var request = new CreateGameRequest
            {
                Name = model.Name,
                Genre = model.Genre,
                Platform = model.Platform,
                Price = model.Price,
                Rating = model.Rating,
                InStock = model.InStock,
                Trailer = trailer,
                Image = imageUrls,
                Description = model.Description
            };

            var game = await _gameService.CreateGameAsync(request);
            return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateGame(int id, [FromForm] CreateGameFormModel model)
        {
            List<string> imageUrls = new();
            if (model.ImageFiles != null)
            {
                try
                {
                    foreach (var file in model.ImageFiles)
                    {
                        var url = await _storage.UploadImageAsync(file);
                        imageUrls.Add(url);
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(502, new { error = "Image upload failed", message = ex.Message });
                }
            }

            string trailer = "";
            if (model.TrailerFile != null)
            {
                try
                {
                    trailer = await _storage.UploadVideoAsync(model.TrailerFile);
                }
                catch (Exception ex)
                {
                    return StatusCode(502, new { error = "Trailer upload failed", message = ex.Message });
                }
            }

            var request = new UpdateGameRequest
            {
                Name = model.Name,
                Genre = model.Genre,
                Platform = model.Platform,
                Price = model.Price,
                Rating = model.Rating,
                InStock = model.InStock,
                Trailer = trailer,
                Image = imageUrls,
                Description = model.Description
            };

            var game = await _gameService.UpdateGameAsync(id, request);
            return Ok(game);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGame(int id)
        {
            var game = await _gameService.GetByIdAsync(id);
            return Ok(game);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGame(int id)
        {
            await _gameService.DeleteGameAsync(id);
            return NoContent();
        }
    }
}