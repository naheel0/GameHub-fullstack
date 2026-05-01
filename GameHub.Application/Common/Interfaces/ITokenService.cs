using GameHub.Domain.Entities;
using System.Security.Claims;

namespace GameHub.Application.Common.interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetClaimsPrincipalFromExpiredToken(string token);
}