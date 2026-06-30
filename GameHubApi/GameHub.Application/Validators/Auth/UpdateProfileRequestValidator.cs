using FluentValidation;
using GameHub.Application.DTOs.Auth;

namespace GameHub.Application.Validators.Auth
{
    public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
    {
        public UpdateProfileRequestValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Phone)
                .Must(phone => string.IsNullOrWhiteSpace(phone) || phone.Length <= 15)
                .WithMessage("Phone must be at most 15 characters");
        }
    }
}
