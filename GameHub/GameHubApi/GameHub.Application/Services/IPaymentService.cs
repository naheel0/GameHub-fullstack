using GameHub.Application.DTOs.Payments;

namespace GameHub.Application.Services
{
    public interface IPaymentService
    {
        Task<PaymentInitiateDto> CreateOrderAsync(int orderId, int userId);
        Task<PaymentLinkInitiateDto> CreatePaymentLinkAsync(int purchaseId, int userId);
        Task<PaymentVerificationDto> VerifyPaymentAsync(PaymentVerifyRequest request, int userId);
    }
}
