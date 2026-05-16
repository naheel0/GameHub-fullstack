using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.CardDetails;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CardDetailsController : ControllerBase
    {
        private readonly ICardDetailService _cardDetailService;
        private readonly ICurrentUserService _currentUserService;

        public CardDetailsController(ICardDetailService cardDetailService, ICurrentUserService currentUserService)
        {
            _cardDetailService = cardDetailService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCardDetails()
        {
            var cards = await _cardDetailService.GetCardDetailsAsync(_currentUserService.UserId!.Value);
            return Ok(cards);
        }

        [HttpGet("{cardDetailId:int}")]
        public async Task<IActionResult> GetCardDetailById(int cardDetailId)
        {
            var card = await _cardDetailService.GetCardDetailByIdAsync(_currentUserService.UserId!.Value, cardDetailId);
            if (card == null) return NotFound(new { message = "Card detail not found" });
            return Ok(card);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCardDetail([FromBody] CreateCardDetailRequest request)
        {
            var card = await _cardDetailService.CreateCardDetailAsync(_currentUserService.UserId!.Value, request);
            return Ok(card);
        }

        [HttpPut("{cardDetailId:int}")]
        public async Task<IActionResult> UpdateCardDetail(int cardDetailId, [FromBody] UpdateCardDetailRequest request)
        {
            await _cardDetailService.UpdateCardDetailAsync(_currentUserService.UserId!.Value, cardDetailId, request);
            return Ok(new { message = "Card detail updated" });
        }

        [HttpDelete("{cardDetailId:int}")]
        public async Task<IActionResult> DeleteCardDetail(int cardDetailId)
        {
            await _cardDetailService.DeleteCardDetailAsync(_currentUserService.UserId!.Value, cardDetailId);
            return Ok(new { message = "Card detail deleted" });
        }
    }
}
