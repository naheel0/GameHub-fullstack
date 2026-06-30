using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Payments;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
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
            try
            {
                var userId = GetCurrentUserId();
                var result = await _paymentService.CreatePaymentLinkAsync(purchaseId, userId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ua)
            {
                return Unauthorized(new { message = ua.Message, error = nameof(UnauthorizedAccessException) });
            }
            catch (NotFoundException nf)
            {
                return NotFound(new { message = nf.Message, error = nameof(NotFoundException) });
            }
            catch (BusinessRuleException br)
            {
                return BadRequest(new { message = br.Message, error = nameof(BusinessRuleException) });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = string.Format(ExceptionMessages.PaymentLinkCreationFailed, ex.Message), error = ex.Message });
            }
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
            try
            {
                var userId = GetCurrentUserId();
                var result = await _paymentService.ConfirmPaymentLinkAsync(request, userId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ua)
            {
                return Unauthorized(new { message = ua.Message, error = nameof(UnauthorizedAccessException) });
            }
            catch (NotFoundException nf)
            {
                return NotFound(new { message = nf.Message, error = nameof(NotFoundException) });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = string.Format(ExceptionMessages.PaymentLinkCreationFailed, ex.Message), error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            return _currentUser.UserId
                ?? throw new UnauthorizedAccessException(ExceptionMessages.Unauthorized);
        }

    }
}
