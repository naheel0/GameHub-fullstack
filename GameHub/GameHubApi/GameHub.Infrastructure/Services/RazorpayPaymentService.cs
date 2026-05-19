using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Payments;
using GameHub.Application.Services;
using GameHub.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Razorpay.Api;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;
using GameHub.Domain.Entities;

namespace GameHub.Infrastructure.Services;

public class RazorpayPaymentService : IPaymentService
{
    private const string RazorpayApiBaseUrl = "https://api.razorpay.com/v1";
    private readonly IApplicationDbContext _context;
    private readonly string _keyId;
    private readonly string _keySecret;
    private readonly string _frontendBaseUrl;

    public RazorpayPaymentService(IApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _keyId = config["Razorpay:KeyId"]!;
        _keySecret = config["Razorpay:KeySecret"]!;
        _frontendBaseUrl = config["Frontend:BaseUrl"] ?? "http://localhost:5173";
    }

    public async Task<PaymentInitiateDto> CreateOrderAsync(int purchaseId, int userId)
    {
        var purchase = await _context.Purchases
            .FirstOrDefaultAsync(p => p.Id == purchaseId && p.UserId == userId)
            ?? throw new NotFoundException("Order not found");

        if (purchase.Status == OrderStatus.Confirmed)
            throw new BusinessRuleException("Order already confirmed");

        int amountInPaise = (int)Math.Round(purchase.Total * 100, MidpointRounding.AwayFromZero);

        var client = new RazorpayClient(_keyId, _keySecret);
        var options = new Dictionary<string, object>
        {
            { "amount", amountInPaise },
            { "currency", "INR" },
            { "receipt", purchase.OrderId },
            { "notes", new Dictionary<string, object>
                {
                    { "purchase_id", purchase.Id.ToString() },
                    { "user_id", userId.ToString() }
                }
            }
        };

        Order razorpayOrder = client.Order.Create(options);
        string razorpayOrderId = razorpayOrder["id"].ToString()!;

        var payment = new GameHub.Domain.Entities.Payment
        {
            PurchaseId = purchase.Id,
            RazorpayOrderId = razorpayOrderId,
            Amount = purchase.Total,
            Currency = "INR",
            Status = PaymentStatus.pending
        };

        _context.Payments.Add(payment);
        await _context.SaveChangeAsync();

        return new PaymentInitiateDto
        {
            RazorpayOrderId = razorpayOrderId,
            PurchaseId = purchase.Id,
            OrderId = purchase.OrderId,
            Amount = purchase.Total,
            Currency = "INR"
        };
    }

    public async Task<PaymentLinkInitiateDto> CreatePaymentLinkAsync(int purchaseId, int userId)
    {
        var purchase = await _context.Purchases
            .Include(p => p.ShippingAddress)
            .FirstOrDefaultAsync(p => p.Id == purchaseId && p.UserId == userId)
            ?? throw new NotFoundException("Order not found");

        if (purchase.Status == OrderStatus.Confirmed)
            throw new BusinessRuleException("Order already confirmed");

        int amountInPaise = (int)Math.Round(purchase.Total * 100, MidpointRounding.AwayFromZero);
        var callbackUrl = $"{_frontendBaseUrl.TrimEnd('/')}/order-confirmation";
        var referenceToken = Guid.NewGuid().ToString("N")[..8];
        var referenceId = $"purchase-{purchase.Id}-{referenceToken}";

        var payload = new Dictionary<string, object>
        {
            { "amount", amountInPaise },
            { "currency", "INR" },
            { "description", $"GameHub order {purchase.OrderId}" },
            { "reference_id", referenceId },
            { "callback_url", callbackUrl },
            { "callback_method", "get" },
            { "notes", new Dictionary<string, object>
                {
                    { "purchase_id", purchase.Id.ToString() },
                    { "user_id", userId.ToString() }
                }
            }
        };

        using var httpClient = new HttpClient();
        var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_keyId}:{_keySecret}"));
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

        var response = await httpClient.PostAsJsonAsync($"{RazorpayApiBaseUrl}/payment_links", payload);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new BusinessRuleException($"Failed to create Razorpay payment link: {responseBody}");

        using var document = JsonDocument.Parse(responseBody);
        var root = document.RootElement;
        var shortUrl = root.GetProperty("short_url").GetString();
        var paymentLinkId = root.GetProperty("id").GetString();

        if (string.IsNullOrWhiteSpace(shortUrl) || string.IsNullOrWhiteSpace(paymentLinkId))
            throw new BusinessRuleException("Razorpay payment link response was invalid");

        return new PaymentLinkInitiateDto
        {
            RazorpayPaymentLinkId = paymentLinkId,
            ShortUrl = shortUrl,
            PurchaseId = purchase.Id,
            OrderId = purchase.OrderId,
            Amount = purchase.Total,
            Currency = "INR"
        };
    }

    public async Task<PaymentVerificationDto> VerifyPaymentAsync(PaymentVerifyRequest request, int userId)
    {
        var payment = await _context.Payments
            .Include(p => p.Purchase)
                .ThenInclude(pu => pu.Items)
            .FirstOrDefaultAsync(p => p.RazorpayOrderId == request.RazorpayOrderId
                                   && p.Purchase.UserId == userId)
            ?? throw new NotFoundException("Payment record not found");

        if (payment.Status == PaymentStatus.Success)
        {
            return new PaymentVerificationDto
            {
                Success = true,
                Message = "Payment already verified",
                PurchaseId = payment.PurchaseId,
                OrderId = payment.Purchase.OrderId
            };
        }

        bool isValid = VerifySignature(
            request.RazorpayOrderId,
            request.RazorpayPaymentId,
            request.RazorpaySignature);

        if (!isValid)
        {
            await using var failedTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                payment.Status = PaymentStatus.Failed;

                // restore cart items from the purchase so the user can retry
                var purchase = payment.Purchase;
                if (purchase?.Items != null && purchase.Items.Any())
                {
                    foreach (var item in purchase.Items)
                    {
                        var cartItem = new CartItem
                        {
                            UserId = userId,
                            GameId = item.GameId,
                            GameName = item.GameName,
                            Price = item.Price,
                            Quantity = item.Quantity,
                            Image = new List<string>(),
                            AddedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.CartItems.Add(cartItem);
                    }
                }

                await _context.SaveChangeAsync();
                await failedTransaction.CommitAsync();
            }
            catch
            {
                await failedTransaction.RollbackAsync();
                throw;
            }

            throw new BusinessRuleException("Payment signature verification failed");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            payment.RazorpayPaymentId = request.RazorpayPaymentId;
            payment.RazorpaySignature = request.RazorpaySignature;
            payment.Status = PaymentStatus.Success;
            payment.PaidAt = DateTime.UtcNow;
            payment.Purchase.Status = OrderStatus.Confirmed;

            var user = await _context.Users.FindAsync(userId);
            if (user != null)
                user.CartItems.Clear();

            await _context.SaveChangeAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return new PaymentVerificationDto
        {
            Success = true,
            Message = "Payment verified successfully",
            PurchaseId = payment.PurchaseId,
            OrderId = payment.Purchase.OrderId
        };
    }

    private bool VerifySignature(string orderId, string paymentId, string signature)
    {
        string payload = $"{orderId}|{paymentId}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_keySecret));
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        string computedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
        return computedSignature == signature.ToLower();
    }

    public async Task RestoreCartFromPurchaseAsync(int purchaseId, int userId)
    {
        var purchase = await _context.Purchases
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == purchaseId && p.UserId == userId);

        if (purchase == null || purchase.Items == null || !purchase.Items.Any())
            return;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in purchase.Items)
            {
                var cartItem = new CartItem
                {
                    UserId = userId,
                    GameId = item.GameId,
                    GameName = item.GameName,
                    Price = item.Price,
                    Quantity = item.Quantity,
                    Image = new List<string>(),
                    AddedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangeAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task RestoreCartFromOrderAsync(Guid orderId, int userId)
    {
        var purchase = await _context.Purchases
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.OrderId == orderId && p.UserId == userId);

        if (purchase == null || purchase.Items == null || !purchase.Items.Any())
            return;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in purchase.Items)
            {
                var cartItem = new CartItem
                {
                    UserId = userId,
                    GameId = item.GameId,
                    GameName = item.GameName,
                    Price = item.Price,
                    Quantity = item.Quantity,
                    Image = new List<string>(),
                    AddedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangeAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}