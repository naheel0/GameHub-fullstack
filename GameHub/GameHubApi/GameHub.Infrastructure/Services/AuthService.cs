using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Auth;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Task = System.Threading.Tasks.Task;

namespace GameHub.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly ICurrentUserService _currentUserService;
        public AuthService(IApplicationDbContext context, ITokenService tokenService, ICurrentUserService currentUserService)
        {
            _context = context;
            _tokenService = tokenService;
            _currentUserService = currentUserService;
        }
        public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return ApiResponse<AuthResponse>.Fail("Email already registered", 400);
            if (request.Password != request.ConfirmPassword)
                return ApiResponse<AuthResponse>.Fail("Passwords do not match", 400);
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = PasswordHasher.Hash(request.Password),
                Role = Domain.Enums.Role.User,
                AccountStatus = Domain.Enums.AccountStatus.Active
            };
            _context.Users.Add(user);
            await _context.SaveChangeAsync();
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                Created = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddDays(7),
                Revoked = false,
                UserId = user.Id
            };
            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangeAsync();
            var authResponse = MapToAuthResponse(user, accessToken, refreshToken);
            return ApiResponse<AuthResponse>.Ok(authResponse, "Registration successful");
        }
        public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, object newRefreshToken)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
                return ApiResponse<AuthResponse>.Fail("Invalid emai; or Password", 401);
            if (user.AccountStatus == Domain.Enums.AccountStatus.Blocked)
                return ApiResponse<AuthResponse>.Fail("Your account has Blocked", 403);
            var accessToken = _tokenService.GenerateAccessToken(user);
            string refreshTokenString = newRefreshToken as string;
            if (string.IsNullOrEmpty(refreshTokenString))
            {
                refreshTokenString = _tokenService.GenerateRefreshToken();
            }
            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshTokenString,
                Created = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddDays(7),
                Revoked = false,
                UserId = user.Id
            };
            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangeAsync();
            var authResponse = MapToAuthResponse(user, accessToken, refreshTokenString);
            return ApiResponse<AuthResponse>.Ok(authResponse, "Login successful");
        }
        public async Task Logout(int userId, string? jti = null)
        {
            var tokens = await _context.RefreshTokens.Where(rt => rt.UserId == userId && !rt.Revoked).ToListAsync();
            if (tokens.Any())
            {
                foreach (var t in tokens)
                {
                    t.Revoked = true;
                }
            }

            if (!string.IsNullOrEmpty(jti))
            {
                // Blacklist the current access token
                var blacklisted = new BlacklistedToken
                {
                    Jti = jti,
                    Expires = DateTime.UtcNow.AddMinutes(30)
                };
                _context.BlacklistedTokens.Add(blacklisted);
            }

            await _context.SaveChangeAsync();
        }
        public async Task<ApiResponse<AuthResponse>> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return ApiResponse<AuthResponse>.Fail("User not found", 404);
            var authResponse = MapToAuthResponse(user, null, null);
            return ApiResponse<AuthResponse>.Ok(authResponse, "profile retrieved");
        }
        private static AuthResponse MapToAuthResponse(User user, string accessToken, object refreshToken)
        {
            return new AuthResponse
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                Status = user.AccountStatus.ToString(),
                AccessToken = accessToken ?? string.Empty,
                RefreshToken = refreshToken as string ?? string.Empty,
            };
        }

        public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
                return ApiResponse<AuthResponse>.Fail("Refresh token is required", 400);

            var existing = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
            if (existing == null || existing.Revoked || existing.Expires < DateTime.UtcNow)
                return ApiResponse<AuthResponse>.Fail("Invalid or expired refresh token", 401);

            var user = await _context.Users.FindAsync(existing.UserId);
            if (user == null)
                return ApiResponse<AuthResponse>.Fail("User not found", 404);

            // Revoke the old refresh token
            existing.Revoked = true;

            // Create a new refresh token
            var newRefreshToken = _tokenService.GenerateRefreshToken();
            var newRefreshTokenEntity = new RefreshToken
            {
                Token = newRefreshToken,
                Created = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddDays(7),
                Revoked = false,
                UserId = user.Id
            };
            _context.RefreshTokens.Add(newRefreshTokenEntity);

            var newAccessToken = _tokenService.GenerateAccessToken(user);
            await _context.SaveChangeAsync();

            var authResponse = MapToAuthResponse(user, newAccessToken, newRefreshToken);
            return ApiResponse<AuthResponse>.Ok(authResponse, "Token refreshed");
        }
    }
}
