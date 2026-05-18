using FluentValidation;
using GameHub.Application.DTOs.Address;

namespace GameHub.Application.Validators.Address
{
    public class CreateAddressRequestValidator : AbstractValidator<CreateAddressRequest>
    {
        public CreateAddressRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_FieldRequired") ?? "{0} is required", "FullName")).MaximumLength(100);
            RuleFor(x => x.AddressLine1).NotEmpty().WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_FieldRequired") ?? "{0} is required", "AddressLine1")).MaximumLength(200);
            RuleFor(x => x.City).NotEmpty().WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_FieldRequired") ?? "{0} is required", "City")).MaximumLength(100);
            RuleFor(x => x.State).MaximumLength(100);
            RuleFor(x => x.ZipCode).NotEmpty().WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_FieldRequired") ?? "{0} is required", "ZipCode")).MaximumLength(20);
            RuleFor(x => x.Country).NotEmpty().WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_FieldRequired") ?? "{0} is required", "Country")).MaximumLength(100);
            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_FieldRequired") ?? "{0} is required", "Phone"))
                .Matches(@"^\+?[0-9() \-]{7,20}$")
                .WithMessage(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PhoneInvalid") ?? "Phone must be a valid Indian or international number and may include +, spaces, dashes, or parentheses (7-20 chars)");
        }
    }
}
