using GameHub.Application.Resources;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;

namespace GameHubApi.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IGlobalExceptionHandler _exceptionHandler;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IGlobalExceptionHandler exceptionHandler)
    {
        _next = next;
        _logger = logger;
        _exceptionHandler = exceptionHandler;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
            if (!context.Response.HasStarted && context.Response.StatusCode is StatusCodes.Status400BadRequest or StatusCodes.Status401Unauthorized or StatusCodes.Status403Forbidden or StatusCodes.Status404NotFound or StatusCodes.Status500InternalServerError)
            {
                var status = context.Response.StatusCode;
                var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

                // If ModelState errors were captured by ApiBehavior, include them in ProblemDetails
                if (status == StatusCodes.Status400BadRequest && context.Items.TryGetValue("ModelStateErrors", out var modelStateObj) && modelStateObj is Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary modelState)
                {
                    var errors = modelState
                        .Where(kv => kv.Value.Errors.Count > 0)
                        .ToDictionary(
                            kv => kv.Key,
                            kv => kv.Value.Errors.Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? e.Exception?.Message ?? "" : e.ErrorMessage).Where(s => !string.IsNullOrEmpty(s)).ToArray()
                        );

                    var detail = GameHub.Application.Resources.ExceptionMessages.BadRequest;
                    var errorCode = nameof(GameHub.Application.Resources.ExceptionMessages.BadRequest);
                    await WriteProblemDetailsAsync(context, status, detail, traceId, errorCode, errors);
                }
                else
                {
                    var detail = GetStatusMessage(status);
                    var errorCode = status switch
                    {
                        StatusCodes.Status400BadRequest => nameof(GameHub.Application.Resources.ExceptionMessages.BadRequest),
                        StatusCodes.Status401Unauthorized => nameof(GameHub.Application.Resources.ExceptionMessages.Unauthorized),
                        StatusCodes.Status403Forbidden => nameof(GameHub.Application.Resources.ExceptionMessages.Forbidden),
                        StatusCodes.Status404NotFound => nameof(GameHub.Application.Resources.ExceptionMessages.NotFound),
                        StatusCodes.Status500InternalServerError => nameof(GameHub.Application.Resources.ExceptionMessages.InternalServerError),
                        _ => null
                    };

                    await WriteProblemDetailsAsync(context, status, detail, traceId, errorCode);
                }
            }
        }
        catch (Exception ex)
        {
            var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
            _logger.LogError(ex, "Unhandled exception {ExceptionType} with traceId {TraceId}", ex.GetType().FullName, traceId);
            var result = _exceptionHandler.Handle(ex);
            await WriteProblemDetailsAsync(context, result.Status, result.Message, traceId, result.ErrorCode);
        }
    }

    private static string GetStatusMessage(int status) => status switch
    {
        StatusCodes.Status400BadRequest => ExceptionMessages.BadRequest,
        StatusCodes.Status401Unauthorized => ExceptionMessages.Unauthorized,
        StatusCodes.Status403Forbidden => ExceptionMessages.Forbidden,
        StatusCodes.Status404NotFound => ExceptionMessages.NotFound,
        StatusCodes.Status500InternalServerError => ExceptionMessages.InternalServerError,
        _ => ExceptionMessages.InternalServerError
    };

    private async Task WriteProblemDetailsAsync(HttpContext context, int status, string message, string? traceId = null, string? errorCode = null, IDictionary<string, string[]>? errors = null)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";

        if (status == StatusCodes.Status401Unauthorized && !context.Response.Headers.ContainsKey("WWW-Authenticate"))
        {
            context.Response.Headers.Append("WWW-Authenticate", "Bearer");
        }

        var problem = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{status}",
            Title = GetTitleForStatus(status),
            Detail = message,
            Status = status,
            Instance = context.Request.Path
        };

        if (!string.IsNullOrWhiteSpace(traceId))
        {
            problem.Extensions["traceId"] = traceId;
        }

        if (!string.IsNullOrWhiteSpace(errorCode))
        {
            problem.Extensions["errorCode"] = errorCode;
        }

        if (errors != null && errors.Count > 0)
        {
            // Include structured field errors for clients to consume
            problem.Extensions["errors"] = errors;
            // Optionally set a more specific detail
            problem.Detail = GameHub.Application.Resources.ExceptionMessages.BadRequest;
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsJsonAsync(problem, options);
    }

    private static string GetTitleForStatus(int status) => status switch
    {
        401 => "Unauthorized",
        403 => "Forbidden",
        400 => "Bad Request",
        404 => "Not Found",
        500 => "Internal Server Error",
        _ => "Error"
    };
}
