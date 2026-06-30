using GameHub.Application.DTOs.Auth;
using GameHub.Application.Resources;
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
        private readonly IEmailService _emailService;
        private readonly IOtpService _otpService;

        public AuthController(IAuthService authService, IConfiguration config, IEmailService emailService, IOtpService otpService)
        {
            _authService = authService;
            _config = config;
            _emailService = emailService;
            _otpService = otpService;
        }

        // ========== NEW: Send OTP for registration ==========
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
        {
            // Optional: Check if email is already registered
            // var existing = await _authService.CheckEmailExistsAsync(request.Email);
            // if (existing) return BadRequest(new { message = "Email already in use." });

            var otp = await _otpService.GenerateAndStoreOtpAsync(request.Email);
            await _emailService.SendOtpEmailAsync(request.Email, otp);

            return Ok(new { message = ExceptionMessages.OtpSentToEmail });
        }

        // ========== NEW: Verify OTP and complete registration ==========
        [HttpPost("verify-and-register")]
        public async Task<IActionResult> VerifyAndRegister([FromBody] VerifyAndRegisterRequest request)
        {
            // 1. Verify OTP
            var isValid = await _otpService.VerifyOtpAsync(request.Email, request.Otp);
            if (!isValid)
                return BadRequest(new { message = ExceptionMessages.InvalidOrExpiredRefreshToken });

            // 2. OTP is correct – now register the user
            var registerRequest = new RegisterRequest
            {
                Email = request.Email,
                Password = request.Password,
                ConfirmPassword = request.ConfirmPassword,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone
            };

            var result = await _authService.RegisterAsync(registerRequest);
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

        // Note: Non-OTP register endpoint removed — use `send-otp` + `verify-and-register`.

        // ... rest of your existing methods (Login, Refresh, Logout, GetProfile, etc.) ...

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
            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest(new { message = ExceptionMessages.RefreshTokenRequired });

            var result = await _authService.RefreshTokenAsync(refreshToken!);
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
            var userId = GetCurrentUserId();
            var jti = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
            await _authService.Logout(userId, jti);
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = ExceptionMessages.LogoutSuccessful });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            var result = await _authService.GetProfileAsync(userId);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode != 0 ? result.StatusCode : 404, result);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _authService.UpdateProfileAsync(userId, request);
            return result.Success ? Ok(result) : StatusCode(result.StatusCode != 0 ? result.StatusCode : 400, result);
        }

        private int GetCurrentUserId()
        {
            var idValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;

            return int.TryParse(idValue, out var parsedId)
                ? parsedId
                : throw new UnauthorizedAccessException(ExceptionMessages.Unauthorized);
        }

        private void SetRefreshTokenCookie(string? token)
        {
            if (string.IsNullOrEmpty(token)) return;
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