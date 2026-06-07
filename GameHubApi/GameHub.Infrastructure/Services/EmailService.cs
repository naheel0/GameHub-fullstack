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
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Gamehub", _config["SmtpSettings:Username"]));
        message.To.Add(new MailboxAddress("", toEmail));
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
        await client.ConnectAsync(_config["SmtpSettings:Host"], int.Parse(_config["SmtpSettings:Port"]), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_config["SmtpSettings:Username"], _config["SmtpSettings:Password"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}