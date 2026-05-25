using FluentValidation;
using GameHub.Application.Common.Models;

namespace GameHub.Application.Validators
{
    public class QueryParametersValidator : AbstractValidator<QueryParameters>
    {
        public QueryParametersValidator()
        {
            RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);

            RuleFor(x => x.SortOrder)
                .Must(s => string.IsNullOrEmpty(s) || s.Equals(QueryParametersConstants.SortOrderAsc, StringComparison.OrdinalIgnoreCase) || s.Equals(QueryParametersConstants.SortOrderDesc, StringComparison.OrdinalIgnoreCase))
                .WithMessage($"_order must be '{QueryParametersConstants.SortOrderAsc}' or '{QueryParametersConstants.SortOrderDesc}'");
        }
    }
}
