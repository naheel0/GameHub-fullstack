using FluentValidation;
using GameHub.Application.DTOs.Admin;
using GameHub.Domain.Enums;

namespace GameHub.Application.Validators.Admin
{
    public class UpdateUserRoleRequestValidator : AbstractValidator<UpdateUserRoleRequest>
    {
        public UpdateUserRoleRequestValidator()
        {
            RuleFor(x => x.Role).NotEmpty().Must(BeAValidRole).WithMessage("Invalid role");
        }

        private bool BeAValidRole(string role)
        {
            return Enum.TryParse<Role>(role, true, out _);
        }
    }
}
