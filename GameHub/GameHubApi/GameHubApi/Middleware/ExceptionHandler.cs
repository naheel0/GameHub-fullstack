using GameHub.Application.Common.Exceptions;
using System.Resources;
using Microsoft.Extensions.Logging;
using GameHub.Application.Resources;

namespace GameHubApi.Middleware;

public class ExceptionHandler : IGlobalExceptionHandler
{
    private readonly ILogger<ExceptionHandler> _logger;

    public ExceptionHandler(ILogger<ExceptionHandler> logger)
    {
        _logger = logger;
    }

    public (int Status, string Message, string ErrorCode) Handle(Exception ex)
    {
        string ResolveMessage(string fallback, string? resourceKey, object[]? args)
        {
            if (string.IsNullOrWhiteSpace(resourceKey)) return fallback;
            try
            {
                var res = ExceptionMessages.ResourceManager.GetString(resourceKey, ExceptionMessages.Culture);
                if (string.IsNullOrEmpty(res))
                {
                    _logger.LogWarning("Resource key '{ResourceKey}' not found in ExceptionMessages resource.", resourceKey);
                    return fallback;
                }
                return args != null && args.Length > 0 ? string.Format(res, args) : res;
            }
            catch (Exception e)
            {
                _logger.LogWarning(e, "Failed to resolve resource '{ResourceKey}' for exception message.", resourceKey);
                return fallback;
            }
        }

        string GetCode(Exception e)
        {
            return e switch
            {
                NotFoundException nf => nf.ResourceKey ?? nf.GetType().Name,
                BusinessRuleException br => br.ResourceKey ?? br.GetType().Name,
                UnauthorizedAccessException ua => "Unauthorized",
                ArgumentException _ => "BadRequest",
                _ => "InternalServerError"
            };
        }

        string GetFallbackMessage(Exception exception) => exception switch
        {
            NotFoundException => ExceptionMessages.NotFound,
            BusinessRuleException => ExceptionMessages.BadRequest,
            UnauthorizedAccessException => ExceptionMessages.Unauthorized,
            ArgumentException => ExceptionMessages.BadRequest,
            _ => ExceptionMessages.InternalServerError
        };

        return ex switch
        {
            NotFoundException nfEx => (StatusCodes.Status404NotFound, ResolveMessage(GetFallbackMessage(nfEx), nfEx.ResourceKey, nfEx.ResourceArgs), GetCode(nfEx)),
            BusinessRuleException brEx => (StatusCodes.Status400BadRequest, ResolveMessage(GetFallbackMessage(brEx), brEx.ResourceKey, brEx.ResourceArgs), GetCode(brEx)),
            ArgumentException argEx => (StatusCodes.Status400BadRequest, ResolveMessage(GetFallbackMessage(argEx), null, null), GetCode(argEx)),
            UnauthorizedAccessException uaEx => (StatusCodes.Status401Unauthorized, ResolveMessage(GetFallbackMessage(uaEx), null, null), GetCode(uaEx)),
            _ => (StatusCodes.Status500InternalServerError, ExceptionMessages.InternalServerError, GetCode(ex))
        };
    }
}
