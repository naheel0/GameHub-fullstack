using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Payments;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    // No try/catch here: ExceptionMiddleware maps NotFoundException→404,
    // BusinessRuleException→400, UnauthorizedAccessException→401, else 500.
    // Baking ex.Message into a 400 was leaking internals.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ICurrentUserService _currentUser;

        public PaymentsController(IPaymentService paymentService, ICurrentUserService currentUser)
        {
            _paymentService = paymentService;
            _currentUser = currentUser;
        }

        [HttpPost("create-link/{purchaseId:int}")]
        public async Task<IActionResult> CreatePaymentLink(int purchaseId)
        {
            var userId = GetCurrentUserId();
            var result = await _paymentService.CreatePaymentLinkAsync(purchaseId, userId);
            return Ok(result);
        }

        [HttpPost("restore/{purchaseId:int}")]
        public async Task<IActionResult> RestorePurchaseToCart(int purchaseId)
        {
            var userId = GetCurrentUserId();
            await _paymentService.RestoreCartFromPurchaseAsync(purchaseId, userId);
            return Ok(new { restored = true });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _paymentService.VerifyPaymentAsync(request, userId);
            return Ok(result);
        }

        [HttpPost("confirm-link")]
        public async Task<IActionResult> ConfirmPaymentLink([FromBody] PaymentLinkConfirmRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _paymentService.ConfirmPaymentLinkAsync(request, userId);
            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            return _currentUser.UserId
                ?? throw new UnauthorizedAccessException(ExceptionMessages.Unauthorized);
        }

    }
}
