using System.ComponentModel.DataAnnotations;

namespace GameHub.Application.Common.Models
{
    public class QueryParameters
    {
        public string? Genre { get; set; }

        public string? Platform { get; set; }

        public string? SortBy { get; set; }

        public string SortOrder { get; set; } = QueryParametersConstants.SortOrderAsc;

        public string? Search { get; set; }

        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 10;

        public bool Ascending => string.Equals(SortOrder, QueryParametersConstants.SortOrderAsc, StringComparison.OrdinalIgnoreCase);

        public int Skip => (Page - 1) * PageSize;
        // Admin-specific filters
        public string? Status { get; set; }
        public string? Role { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
