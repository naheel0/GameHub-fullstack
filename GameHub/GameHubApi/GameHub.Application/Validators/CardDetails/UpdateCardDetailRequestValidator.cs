using FluentValidation;
using GameHub.Application.DTOs.CardDetails;
using System;

namespace GameHub.Application.Validators.CardDetails
{
    public class UpdateCardDetailRequestValidator : AbstractValidator<UpdateCardDetailRequest>
    {
        public UpdateCardDetailRequestValidator()
        {
            RuleFor(x => x.CardNumber)
                .NotEmpty()
                .Matches(@"^[0-9\s\-]{13,19}$")
                .WithMessage("Card number must be 13 to 19 digits")
                .Must(BeValidLuhn).WithMessage("Card number is invalid");

            RuleFor(x => x.ExpiryDate)
                .NotEmpty()
                .Must(BeAValidExpiry)
                .WithMessage("Expiry date must be in MM/YY or MM/YYYY format and not expired");

            RuleFor(x => x.Cvv)
                .NotEmpty()
                .Matches(@"^\d{3,4}$");

            RuleFor(x => x.CardholderName)
                .NotEmpty()
                .MaximumLength(100);
        }

        private bool BeValidLuhn(string cardNumber)
        {
            if (string.IsNullOrWhiteSpace(cardNumber)) return false;
            var digits = System.Text.RegularExpressions.Regex.Replace(cardNumber, "[^0-9]", "");
            int sum = 0; bool alt = false;
            for (int i = digits.Length - 1; i >= 0; i--)
            {
                int d = digits[i] - '0';
                if (alt) { d *= 2; if (d > 9) d -= 9; }
                sum += d; alt = !alt;
            }
            return sum % 10 == 0;
        }

        private bool BeAValidExpiry(string expiry)
        {
            if (string.IsNullOrWhiteSpace(expiry)) return false;
            expiry = expiry.Trim();
            string[] parts = expiry.Split('/');
            if (parts.Length != 2) return false;
            if (!int.TryParse(parts[0], out int month)) return false;
            if (parts[1].Length == 2)
            {
                if (!int.TryParse(parts[1], out int yy)) return false;
                int year = 2000 + yy;
                return !IsExpired(month, year);
            }
            else if (parts[1].Length == 4)
            {
                if (!int.TryParse(parts[1], out int year)) return false;
                return !IsExpired(month, year);
            }
            return false;
        }

        private bool IsExpired(int month, int year)
        {
            if (month < 1 || month > 12) return true;
            var lastDay = DateTime.DaysInMonth(year, month);
            var exp = new DateTime(year, month, lastDay, 23, 59, 59);
            return exp < DateTime.UtcNow;
        }
    }
}
