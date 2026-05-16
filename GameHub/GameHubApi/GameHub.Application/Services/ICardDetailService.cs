using GameHub.Application.DTOs.CardDetails;

namespace GameHub.Application.Services
{
    public interface ICardDetailService
    {
        Task<List<CardDetailDto>> GetCardDetailsAsync(int userId);
        Task<CardDetailDto?> GetCardDetailByIdAsync(int userId, int cardDetailId);
        Task<CardDetailDto> CreateCardDetailAsync(int userId, CreateCardDetailRequest request);
        Task UpdateCardDetailAsync(int userId, int cardDetailId, UpdateCardDetailRequest request);
        Task DeleteCardDetailAsync(int userId, int cardDetailId);
    }
}
