using GameHub.Application.Common.interfaces;
using GameHub.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GameHub.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;
        var idValue = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        UserId = idValue is not null ? int.Parse(idValue) : null;
        Email = user?.FindFirst(ClaimTypes.Email)?.Value;
        Role = user?.FindFirst(ClaimTypes.Role)?.Value;
    }
    public int? UserId { get; }
    public string Email { get; }
    public string Role { get; }
}