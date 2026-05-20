using GameHub.Application.DTOs.Auth;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _config;
        public AuthController(IAuthService authService, IConfiguration config)
        {
            _authService = authService;
            _config = config;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            if (result.Success)
            {
                var refreshToken = result.Data?.RefreshToken ?? string.Empty;
                if (!string.IsNullOrEmpty(refreshToken))
                    SetRefreshTokenCookie(refreshToken);
                if (result.Data != null) result.Data.RefreshToken = null;
                var successStatus = result.StatusCode != 0 ? result.StatusCode : 200;
                return StatusCode(successStatus, result);
            }

            var failStatus = result.StatusCode != 0 ? result.StatusCode : 400;
            return StatusCode(failStatus, result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request, string.Empty);
            if (!result.Success)
                return StatusCode(result.StatusCode != 0 ? result.StatusCode : 401, result);
            var refreshToken = result.Data?.RefreshToken ?? string.Empty;
            if (!string.IsNullOrEmpty(refreshToken))
                SetRefreshTokenCookie(refreshToken);
            if (result.Data != null) result.Data.RefreshToken = null;
            return Ok(result);
        }
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var result = await _authService.RefreshTokenAsync(refreshToken);
            if (!result.Success)
                return StatusCode(result.StatusCode != 0 ? result.StatusCode : 401, result);
            SetRefreshTokenCookie(result.Data!.RefreshToken);
            result.Data.RefreshToken = null;
            return Ok(result);
        }
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var jti = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
            await _authService.Logout(userId, jti);
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "logged out" });
        }
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var result = await _authService.GetProfileAsync(userId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode != 0 ? result.StatusCode : 404, result);
        }
        private void SetRefreshTokenCookie(string token)
        {
            var days = 7;
            var cfg = _config.GetSection("JwtSettings");
            if (cfg != null && int.TryParse(cfg["RefreshTokenExpirationDays"], out var parsed))
                days = parsed;

            var cookieOptions = new CookieOptions
            {
                Secure = true,
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(days),
                SameSite = SameSiteMode.None
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }

    }
}
