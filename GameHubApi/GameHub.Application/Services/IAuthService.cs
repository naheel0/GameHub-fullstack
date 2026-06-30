using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Auth;

namespace GameHub.Application.Services;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, object newRefreshToken);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string refreshToken);
    Task Logout(int UserId, string? jti = null);
    Task<ApiResponse<AuthResponse>> GetProfileAsync(int userId);
    Task<ApiResponse<AuthResponse>> UpdateProfileAsync(int userId, UpdateProfileRequest request);
}