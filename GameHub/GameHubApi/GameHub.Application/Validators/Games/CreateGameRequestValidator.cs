using FluentValidation;
using GameHub.Application.DTOs.Games;

namespace GameHub.Application.Validators.Games
{
    public class CreateGameRequestValidator : AbstractValidator<CreateGameRequest>
    {
        public CreateGameRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Genre).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Platform).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Rating).InclusiveBetween(0, 10);
        }
    }
}
