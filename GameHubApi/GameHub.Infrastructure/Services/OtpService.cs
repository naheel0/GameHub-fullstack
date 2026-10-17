using GameHub.Application.Common.Exceptions;
using GameHub.Application.Resources;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;

public class OtpService : IOtpService
{
    private const int MaxAttempts = 5;          // wrong guesses before the code is killed
    private const int OtpLifetimeMinutes = 10;
    private const int ResendCooldownSeconds = 60;

    private readonly IMemoryCache _cache;
    public OtpService(IMemoryCache cache) => _cache = cache;

    public Task<string> GenerateAndStoreOtpAsync(string email)
    {
        // resend cooldown: stops this endpoint from being used to flood mailboxes
        if (_cache.TryGetValue(CooldownKey(email), out _))
            throw new BusinessRuleException(ExceptionMessages.OtpSendThrottled, nameof(ExceptionMessages.OtpSendThrottled));

        var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        _cache.Set(OtpKey(email), otp, TimeSpan.FromMinutes(OtpLifetimeMinutes));
        _cache.Remove(AttemptsKey(email));
        _cache.Set(CooldownKey(email), true, TimeSpan.FromSeconds(ResendCooldownSeconds));
        return Task.FromResult(otp);
    }

    public Task<bool> VerifyOtpAsync(string email, string otp)
    {
        var key = OtpKey(email);
        if (!_cache.TryGetValue(key, out string? storedOtp))
            return Task.FromResult(false); // expired or never issued

        if (storedOtp != otp)
        {
            // attempt counting bounds brute-force guessing
            var attempts = (_cache.Get(AttemptsKey(email)) as int?) ?? 0;
            if (attempts + 1 >= MaxAttempts)
            {
                // too many wrong guesses — invalidate the code immediately
                _cache.Remove(key);
                _cache.Remove(AttemptsKey(email));
            }
            else
            {
                _cache.Set(AttemptsKey(email), attempts + 1, TimeSpan.FromMinutes(OtpLifetimeMinutes));
            }
            return Task.FromResult(false);
        }

        _cache.Remove(key);
        _cache.Remove(AttemptsKey(email));
        return Task.FromResult(true);
    }

    private static string OtpKey(string email) => $"otp:{email}";
    private static string AttemptsKey(string email) => $"otp-attempts:{email}";
    private static string CooldownKey(string email) => $"otp-cooldown:{email}";
}
