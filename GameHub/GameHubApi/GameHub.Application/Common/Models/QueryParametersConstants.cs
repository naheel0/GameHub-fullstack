namespace GameHub.Application.Common.Models
{
    public static class QueryParametersConstants
    {
        public const string SortByName = "name";
        public const string SortByPrice = "price";
        public const string SortByRating = "rating";

        public static readonly string[] AllowedSorts = { SortByName, SortByPrice, SortByRating };

        public const string SortOrderAsc = "asc";
        public const string SortOrderDesc = "desc";
    }
}
