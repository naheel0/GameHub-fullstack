using FluentValidation;
using GameHub.Application.DTOs.Cart;

namespace GameHub.Application.Validators.Cart
{
    public class AddToCartRequestValidator : AbstractValidator<AddToCartRequest>
    {
        public AddToCartRequestValidator()
        {
            RuleFor(x => x.GameId).GreaterThan(0);
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(1);
        }
    }
}
