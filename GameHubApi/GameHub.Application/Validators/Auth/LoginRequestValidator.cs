using FluentValidation;
using GameHub.Application.DTOs.Auth;

namespace GameHub.Application.Validators.Auth
{
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(8).WithMessage(string.Format(GameHub.Application.Resources.ExceptionMessages.ResourceManager.GetString("Validation_PasswordMinLength") ?? "Password must be at least {0} characters long", 8));
        }
    }
}
