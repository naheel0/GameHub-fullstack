using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System.Net.Mail;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    public EmailService(IConfiguration config) => _config = config;

    public async Task SendOtpEmailAsync(string toEmail, string otpCode)
    {
        var username = _config["SmtpSettings:Username"] ?? "GameHub";
        var password = _config["SmtpSettings:Password"] ?? string.Empty;
        var host = _config["SmtpSettings:Host"] ?? "localhost";
        var portStr = _config["SmtpSettings:Port"] ?? "587";

        if (!int.TryParse(portStr, out var port))
            port = 587;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("GameHub", username));
        message.To.Add(new MailboxAddress(string.Empty, toEmail));
        message.Subject = "Verify your email address";
        message.Body = new TextPart("html")
        {
            Text = $@"
                <h2>Welcome!</h2>
                <p>Your verification code is:</p>
                <h1 style='background:#f0f0f0;padding:10px;'>{otpCode}</h1>
                <p>This code expires in 10 minutes.</p>"
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(username, password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}