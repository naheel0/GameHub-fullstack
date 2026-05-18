using FluentValidation;
using GameHub.Application.DTOs.Orders;

namespace GameHub.Application.Validators.Orders
{
    public class PlaceOrderRequestValidator : AbstractValidator<PlaceOrderRequest>
    {
        public PlaceOrderRequestValidator()
        {
            RuleFor(x => x.AddressId).NotEmpty().Must(g => g != Guid.Empty).WithMessage("AddressId is required");
            RuleFor(x => x.PaymentMethod).IsInEnum();
        }
    }
}
