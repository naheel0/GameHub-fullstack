using FluentValidation;
using GameHub.Application.DTOs.Auth;
using System.Text.RegularExpressions;

namespace GameHub.Application.Validators.Auth
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Phone)
                .Must(phone => string.IsNullOrWhiteSpace(phone) || Regex.IsMatch(phone, @"^\+?[0-9() \-]{7,20}$"))
                .WithMessage(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PhoneInvalid") ?? "Phone must be a valid Indian or international number and may include +, spaces, dashes, or parentheses (7-20 chars)");

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_FieldRequired") ?? "{0} is required", "Password"))
                .MinimumLength(8).WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PasswordMinLength") ?? "Password must be at least {0} characters long", 8))
                .Matches(@"(?=.*[a-z])").WithMessage(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PasswordLowercase") ?? "Password must contain at least one lowercase letter")
                .Matches(@"(?=.*[A-Z])").WithMessage(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PasswordUppercase") ?? "Password must contain at least one uppercase letter")
                .Matches(@"(?=.*\d)").WithMessage(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PasswordDigit") ?? "Password must contain at least one digit")
                .Matches(@"(?=.*[^A-Za-z0-9])").WithMessage(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PasswordSpecial") ?? "Password must contain at least one special character");

            RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("Passwords do not match");
        }
    }
}
