using FluentValidation;
using GameHub.Application.DTOs.Orders;

namespace GameHub.Application.Validators.Orders
{
    public class BuyNowRequestValidator : AbstractValidator<BuyNowRequest>
    {
        public BuyNowRequestValidator()
        {
            RuleFor(x => x.GameId).GreaterThan(0);
            RuleFor(x => x.Quantity).InclusiveBetween(1, 99);
            RuleFor(x => x.AddressId).NotEmpty().Must(g => g != Guid.Empty).WithMessage("AddressId is required");
        }
    }
}
