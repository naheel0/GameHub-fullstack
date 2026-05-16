using System.Text.Json;
using GameHub.Application.Common.Exceptions;
using System.Resources;

namespace GameHubApi.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.ContentType = "application/json";

            string message;
            int status;

            if (ex is GameHub.Application.Common.Exceptions.NotFoundException nfEx)
            {
                status = StatusCodes.Status404NotFound;
                message = ResolveMessage(nfEx.Message, nfEx.ResourceKey, nfEx.ResourceArgs);
            }
            else if (ex is BusinessRuleException brEx)
            {
                status = StatusCodes.Status400BadRequest;
                message = ResolveMessage(brEx.Message, brEx.ResourceKey, brEx.ResourceArgs);
            }
            else if (ex is KeyNotFoundException)
            {
                status = StatusCodes.Status404NotFound;
                message = ex.Message;
            }
            else
            {
                status = StatusCodes.Status500InternalServerError;
                message = "An unexpected error occurred";
            }

            context.Response.StatusCode = status;
            var payload = JsonSerializer.Serialize(new { error = message });
            await context.Response.WriteAsync(payload);

            string ResolveMessage(string fallback, string? resourceKey, object[]? args)
            {
                if (string.IsNullOrWhiteSpace(resourceKey)) return fallback;
                try
                {
                    var rm = new ResourceManager("GameHub.Application.Resources.ExceptionMessages", typeof(GameHub.Application.Common.Exceptions.BusinessRuleException).Assembly);
                    var res = rm.GetString(resourceKey);
                    if (string.IsNullOrEmpty(res)) return fallback;
                    return args != null && args.Length > 0 ? string.Format(res, args) : res;
                }
                catch
                {
                    return fallback;
                }
            }
        }
    }
}
