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
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            if (result.Success)
            {
                SetRefreshTokenCookies(result.Data?.AccessToken ?? string.Empty, out _);
                var successStatus = result.StatusCode != 0 ? result.StatusCode : 200;
                return StatusCode(successStatus, result);
            }

            var failStatus = result.StatusCode != 0 ? result.StatusCode : 400;
            return StatusCode(failStatus, result);
        }

        private void SetRefreshTokenCookies(string token, out string cookieValue)
        {
            cookieValue = string.Empty;
            if (string.IsNullOrEmpty(token))
                return;

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7)
            };

            Response.Cookies.Append("refreshToken", token, cookieOptions);
            cookieValue = token;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            // Pass empty string for newRefreshToken when not provided by client
            var result = await _authService.LoginAsync(request, string.Empty);
            if(!result.Success)
                return StatusCode(result.StatusCode != 0 ? result.StatusCode : 401, result);
            var refreshToken = result.Data?.RefreshToken ?? string.Empty;
            if (!string.IsNullOrEmpty(refreshToken))
            {
                SetRefreshTokenCookies(refreshToken, out _);
            }
            // Do not return refresh token in response body
            if (result.Data != null)
                result.Data.RefreshToken = null;
            return Ok(result);
        }
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var result=await _authService.RefreshTokenAsync(refreshToken);
            if (!result.Success)
                return StatusCode(result.StatusCode != 0 ? result.StatusCode : 401, result);
            SetRefreshTokenCookies(result.Data!.RefreshToken, out _);
            result.Data.RefreshToken = null;
            return Ok(result);
        }
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            await _authService.Logout(userId);
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "logged out" });
        }
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var result =await _authService.GetProfileAsync(userId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode != 0 ? result.StatusCode : 404, result);
        }
        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                Secure = true,
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Strict
            };
            Response.Cookies.Append("refreshToken",token, cookieOptions);
        }

    }
}
