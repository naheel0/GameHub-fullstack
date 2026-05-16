using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.CardDetails;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Infrastructure.Services
{
    public class CardDetailService : ICardDetailService
    {
        private readonly IApplicationDbContext _context;

        public CardDetailService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CardDetailDto>> GetCardDetailsAsync(int userId)
        {
            return await _context.CardDetails
                .Where(c => c.UserId == userId)
                .Select(c => new CardDetailDto
                {
                    Id = c.Id,
                    CardNumber = c.CardNumber,
                    ExpiryDate = c.ExpiryDate,
                    Cvv = c.Cvv,
                    CardholderName = c.CardholderName,
                    IsDefault = c.IsDefault
                })
                .ToListAsync();
        }

        public async Task<CardDetailDto?> GetCardDetailByIdAsync(int userId, int cardDetailId)
        {
            return await _context.CardDetails
                .Where(c => c.UserId == userId && c.Id == cardDetailId)
                .Select(c => new CardDetailDto
                {
                    Id = c.Id,
                    CardNumber = c.CardNumber,
                    ExpiryDate = c.ExpiryDate,
                    Cvv = c.Cvv,
                    CardholderName = c.CardholderName,
                    IsDefault = c.IsDefault
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CardDetailDto> CreateCardDetailAsync(int userId, CreateCardDetailRequest request)
        {
            var hasAny = await _context.CardDetails.AnyAsync(c => c.UserId == userId);

            if (request.IsDefault)
            {
                var existingDefaults = _context.CardDetails.Where(c => c.UserId == userId && c.IsDefault);
                await existingDefaults.ForEachAsync(c => c.IsDefault = false);
            }

            var card = new CardDetail
            {
                UserId = userId,
                CardNumber = request.CardNumber,
                ExpiryDate = request.ExpiryDate,
                Cvv = request.Cvv,
                CardholderName = request.CardholderName,
                IsDefault = request.IsDefault || !hasAny
            };

            _context.CardDetails.Add(card);
            await _context.SaveChangeAsync();

            return new CardDetailDto
            {
                Id = card.Id,
                CardNumber = card.CardNumber,
                ExpiryDate = card.ExpiryDate,
                Cvv = card.Cvv,
                CardholderName = card.CardholderName,
                IsDefault = card.IsDefault
            };
        }

        public async Task UpdateCardDetailAsync(int userId, int cardDetailId, UpdateCardDetailRequest request)
        {
            var card = await _context.CardDetails
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == cardDetailId)
                ?? throw new NotFoundException("Card detail not found", "CardDetailNotFound");

            card.CardNumber = request.CardNumber;
            card.ExpiryDate = request.ExpiryDate;
            card.Cvv = request.Cvv;
            card.CardholderName = request.CardholderName;

            if (request.IsDefault && !card.IsDefault)
            {
                var existingDefaults = _context.CardDetails.Where(c => c.UserId == userId && c.IsDefault);
                await existingDefaults.ForEachAsync(c => c.IsDefault = false);
                card.IsDefault = true;
            }
            else if (!request.IsDefault)
            {
                card.IsDefault = false;
            }

            await _context.SaveChangeAsync();
        }

        public async Task DeleteCardDetailAsync(int userId, int cardDetailId)
        {
            var card = await _context.CardDetails
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == cardDetailId);

            if (card == null)
            {
                return;
            }

            var wasDefault = card.IsDefault;
            _context.CardDetails.Remove(card);
            await _context.SaveChangeAsync();

            if (wasDefault)
            {
                var nextCard = await _context.CardDetails
                    .Where(c => c.UserId == userId)
                    .OrderBy(c => c.Id)
                    .FirstOrDefaultAsync();

                if (nextCard != null)
                {
                    nextCard.IsDefault = true;
                    await _context.SaveChangeAsync();
                }
            }
        }
    }
}
