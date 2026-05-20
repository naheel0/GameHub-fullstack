using GameHub.Application.Common.Models;

namespace GameHubApi.Helpers
{
    public static class AdminQueryBinder
    {
        public static AdminQueryParameters FromRequest(HttpRequest request, AdminQueryParameters? incoming = null)
        {
            var q = incoming ?? new AdminQueryParameters();
            if (request.Query.TryGetValue("_sort", out var s)) q.SortBy = s;
            if (request.Query.TryGetValue("_order", out var o)) q.SortOrder = o;
            if (request.Query.TryGetValue("q", out var qq)) q.Search = qq;
            if (request.Query.TryGetValue("_page", out var p) && int.TryParse(p, out var pi)) q.Page = pi;
            if (request.Query.TryGetValue("_limit", out var l) && int.TryParse(l, out var li)) q.PageSize = li;

            q.Page = Math.Max(1, q.Page);
            q.PageSize = Math.Clamp(q.PageSize, 1, 100);

            return q;
        }
    }
}
