using Microsoft.Extensions.Caching.Memory;

public class OtpService : IOtpService
{
    private readonly IMemoryCache _cache;
    public OtpService(IMemoryCache cache) => _cache = cache;

    public Task<string> GenerateAndStoreOtpAsync(string email)
    {
        var otp = new Random().Next(100000, 999999).ToString();
        _cache.Set(email, otp, TimeSpan.FromMinutes(10));
        return Task.FromResult(otp);
    }

    public Task<bool> VerifyOtpAsync(string email, string otp)
    {
        if (_cache.TryGetValue(email, out string storedOtp) && storedOtp == otp)
        {
            _cache.Remove(email);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }
}