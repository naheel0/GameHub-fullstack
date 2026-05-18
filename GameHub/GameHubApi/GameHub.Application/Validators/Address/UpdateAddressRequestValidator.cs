using FluentValidation;
using GameHub.Application.DTOs.Address;

namespace GameHub.Application.Validators.Address
{
    public class UpdateAddressRequestValidator : AbstractValidator<UpdateAddressRequest>
    {
        public UpdateAddressRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(200);
            RuleFor(x => x.City).NotEmpty().MaximumLength(100);
            RuleFor(x => x.State).MaximumLength(100);
            RuleFor(x => x.ZipCode).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Phone)
                .NotEmpty()
                .Matches(@"^\+?[0-9() \-]{7,20}$")
                .WithMessage("Phone must be a valid Indian or international number and may include +, spaces, dashes, or parentheses (7-20 chars)");
        }
    }
}
