using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Exceptions;
using GameHub.Application.DTOs.Payments;
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

        [HttpPost("create-order/{purchaseId:int}")]
        public async Task<IActionResult> CreateOrder(int purchaseId)
        {
            var result = await _paymentService.CreateOrderAsync(purchaseId, _currentUser.UserId!.Value);
            return Ok(result);
        }

        [HttpPost("create-link/{purchaseId:int}")]
        public async Task<IActionResult> CreatePaymentLink(int purchaseId)
        {
            try
            {
                var result = await _paymentService.CreatePaymentLinkAsync(purchaseId, _currentUser.UserId!.Value);
                return Ok(result);
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
                return BadRequest(new { message = "Failed to create payment link", error = ex.Message });
            }
        }

        [HttpPost("restore/{purchaseId:int}")]
        public async Task<IActionResult> RestorePurchaseToCart(int purchaseId)
        {
            await _paymentService.RestoreCartFromPurchaseAsync(purchaseId, _currentUser.UserId!.Value);
            return Ok(new { restored = true });
        }

        [HttpPost("restore-by-order/{orderId:guid}")]
        public async Task<IActionResult> RestorePurchaseByOrder(Guid orderId)
        {
            await _paymentService.RestoreCartFromOrderAsync(orderId, _currentUser.UserId!.Value);
            return Ok(new { restored = true });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyRequest request)
        {
            var result = await _paymentService.VerifyPaymentAsync(request, _currentUser.UserId!.Value);
            return Ok(result);
        }

    }
}
