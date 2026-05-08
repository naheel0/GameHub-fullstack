using FluentValidation;
using GameHub.Application.Common.Models;

namespace GameHub.Application.Validators
{
    public class QueryParametersValidator : AbstractValidator<QueryParameters>
    {
        private static readonly string[] AllowedSorts = { "name", "price", "rating" };

        public QueryParametersValidator()
        {
            RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);

            RuleFor(x => x.SortOrder)
                .Must(s => string.IsNullOrEmpty(s) || s.Equals("asc", System.StringComparison.OrdinalIgnoreCase) || s.Equals("desc", System.StringComparison.OrdinalIgnoreCase))
                .WithMessage("_order must be 'asc' or 'desc'");

            RuleFor(x => x.SortBy)
                .Must(s => string.IsNullOrWhiteSpace(s) || AllowedSorts.Contains(s.ToLower()))
                .WithMessage($"_sort must be one of: {string.Join(',', AllowedSorts)}");
        }
    }
}
