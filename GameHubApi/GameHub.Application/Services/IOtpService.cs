public interface IOtpService
{
    Task<string> GenerateAndStoreOtpAsync(string email);
    Task<bool> VerifyOtpAsync(string email, string otp);
}