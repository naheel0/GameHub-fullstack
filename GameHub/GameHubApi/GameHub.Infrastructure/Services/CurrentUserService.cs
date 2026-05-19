using GameHub.Application.Common.interfaces;
using GameHub.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GameHub.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;
        var idValue = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        UserId = int.TryParse(idValue, out var parsedId) ? parsedId : null;

        Email = user?.FindFirst(ClaimTypes.Email)?.Value
            ?? user?.FindFirst(JwtRegisteredClaimNames.Email)?.Value;

        Role = user?.FindFirst(ClaimTypes.Role)?.Value
            ?? user?.FindFirst("role")?.Value;
    }
    public int? UserId { get; }
    public string Email { get; }
    public string Role { get; }
}