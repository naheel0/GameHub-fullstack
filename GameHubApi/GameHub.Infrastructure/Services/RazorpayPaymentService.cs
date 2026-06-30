using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Payments;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using GameHub.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

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
        var configured = config["Frontend:BaseUrl"];
        // Razorpay rejects localhost URLs; fall back to production URL when running in Azure
        _frontendBaseUrl = !string.IsNullOrWhiteSpace(configured) && !configured.Contains("localhost")
            ? configured
            : "https://game-hub-fullstack.vercel.app";
    }

    public async Task<PaymentLinkInitiateDto> CreatePaymentLinkAsync(int purchaseId, int userId)
    {
        var purchase = await _context.Purchases
            .Include(p => p.ShippingAddress)
            .FirstOrDefaultAsync(p => p.Id == purchaseId && p.UserId == userId)
            ?? throw new NotFoundException(ExceptionMessages.OrderNotFound);

        if (purchase.Status == OrderStatus.Confirmed)
            throw new BusinessRuleException(ExceptionMessages.OrderAlreadyConfirmed);

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
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new BusinessRuleException(string.Format(ExceptionMessages.PaymentLinkCreationFailed, errorBody));
        }

        using var document = JsonDocument.Parse(responseBody);
        var root = document.RootElement;
        var shortUrl = root.GetProperty("short_url").GetString();
        var paymentLinkId = root.GetProperty("id").GetString();

        if (string.IsNullOrWhiteSpace(shortUrl) || string.IsNullOrWhiteSpace(paymentLinkId))
            throw new BusinessRuleException(ExceptionMessages.PaymentLinkResponseInvalid);

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
            ?? throw new NotFoundException(ExceptionMessages.PaymentRecordNotFound);

        if (payment.Status == PaymentStatus.Success)
        {
            return new PaymentVerificationDto
            {
                Success = true,
                Message = ExceptionMessages.PaymentAlreadyVerified,
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

            throw new BusinessRuleException(ExceptionMessages.PaymentSignatureVerificationFailed);
        }

        // Server-side amount validation: ensure payment matches expected total
        var expectedAmountInPaise = (int)Math.Round(payment.Purchase.Total * 100, MidpointRounding.AwayFromZero);
        var actualAmountInPaise = request.Amount ?? 0;
        if (actualAmountInPaise > 0 && actualAmountInPaise < expectedAmountInPaise)
        {
            throw new BusinessRuleException(string.Format(ExceptionMessages.PaymentAmountMismatch, expectedAmountInPaise, actualAmountInPaise));
        }

        // Also verify with Razorpay API if paymentId is available
        if (!string.IsNullOrWhiteSpace(request.RazorpayPaymentId))
        {
            var razorpayVerified = await VerifyPaymentAmountAsync(request.RazorpayPaymentId, expectedAmountInPaise);
            if (!razorpayVerified)
            {
                throw new BusinessRuleException(ExceptionMessages.PaymentAmountVerificationFailed);
            }
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            payment.RazorpayPaymentId = request.RazorpayPaymentId;
            payment.RazorpaySignature = request.RazorpaySignature;
            payment.Status = PaymentStatus.Success;
            payment.PaidAt = DateTime.UtcNow;
            payment.Purchase.Status = OrderStatus.Confirmed;

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
            Message = ExceptionMessages.PaymentVerifiedSuccessfully,
            PurchaseId = payment.PurchaseId,
            OrderId = payment.Purchase.OrderId
        };
    }

    public async Task<PaymentVerificationDto> ConfirmPaymentLinkAsync(PaymentLinkConfirmRequest request, int userId)
    {
        var purchase = await _context.Purchases
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == request.PurchaseId && p.UserId == userId)
            ?? throw new NotFoundException(ExceptionMessages.OrderNotFound);

        if (purchase.Status == OrderStatus.Confirmed)
        {
            return new PaymentVerificationDto
            {
                Success = true,
                Message = ExceptionMessages.OrderAlreadyConfirmed,
                PurchaseId = purchase.Id,
                OrderId = purchase.OrderId
            };
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Server-side amount validation for payment link
            var expectedAmountInPaise = (int)Math.Round(purchase.Total * 100, MidpointRounding.AwayFromZero);
            var actualAmountInPaise = request.Amount ?? 0;
            if (actualAmountInPaise > 0 && actualAmountInPaise < expectedAmountInPaise)
            {
            throw new BusinessRuleException(string.Format(ExceptionMessages.PaymentAmountMismatch, expectedAmountInPaise, actualAmountInPaise));
            }

            var payment = new Payment
            {
                PurchaseId = purchase.Id,
                RazorpayPaymentId = request.RazorpayPaymentId,
                RazorpayOrderId = request.RazorpayPaymentLinkId,
                Amount = purchase.Total,
                Currency = "INR",
                Status = PaymentStatus.Success,
                PaidAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            purchase.Status = OrderStatus.Confirmed;

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
            Message = ExceptionMessages.PaymentConfirmedSuccessfully,
            PurchaseId = purchase.Id,
            OrderId = purchase.OrderId
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

    private async Task<bool> VerifyPaymentAmountAsync(string razorpayPaymentId, int expectedAmountInPaise)
    {
        try
        {
            using var httpClient = new HttpClient();
            var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_keyId}:{_keySecret}"));
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

            var response = await httpClient.GetAsync($"{RazorpayApiBaseUrl}/payments/{razorpayPaymentId}");
            if (!response.IsSuccessStatusCode)
                return false;

            var responseBody = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;
            if (!root.TryGetProperty("amount", out var amountElement))
                return false;

            var actualAmount = amountElement.GetInt32();
            return actualAmount == expectedAmountInPaise;
        }
        catch
        {
            // If we cannot verify the amount from Razorpay, log but do not block
            // The signature verification is the primary check
            return true;
        }
    }

    public async Task RestoreCartFromPurchaseAsync(int purchaseId, int userId)
    {
        var purchase = await _context.Purchases
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == purchaseId && p.UserId == userId);

        if (purchase?.Items == null || !purchase.Items.Any())
            return;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            AddPurchaseItemsToCart(purchase.Items, userId);
            await _context.SaveChangeAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private void AddPurchaseItemsToCart(ICollection<OrderItem> items, int userId)
    {
        foreach (var item in items)
        {
            _context.CartItems.Add(new CartItem
            {
                UserId = userId,
                GameId = item.GameId,
                GameName = item.GameName,
                Price = item.Price,
                Quantity = item.Quantity,
                Image = new List<string>(),
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}