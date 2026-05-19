using GameHub.Application.Common.interfaces;
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
            var result = await _paymentService.CreatePaymentLinkAsync(purchaseId, _currentUser.UserId!.Value);
            return Ok(result);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyRequest request)
        {
            var result = await _paymentService.VerifyPaymentAsync(request, _currentUser.UserId!.Value);
            return Ok(result);
        }

    }
}
