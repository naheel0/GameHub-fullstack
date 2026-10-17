using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Payments;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using GameHub.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace GameHub.Infrastructure.Services;

/// <summary>
/// Payment-link flow. The only trustworthy source for "was this paid" is
/// Razorpay's own API: confirm-link fetches the payment link and cross-checks
/// the payment id and amount before anything is marked paid. Money values in
/// the Razorpay API are integer paise.
/// </summary>
public class RazorpayPaymentService : IPaymentService
{
    private const string RazorpayApiBaseUrl = "https://api.razorpay.com/v1";
    private readonly IApplicationDbContext _context;
    private readonly HttpClient _http;
    private readonly string _keySecret;
    private readonly string _frontendBaseUrl;
    private readonly ILogger<RazorpayPaymentService> _logger;

    public RazorpayPaymentService(
        IApplicationDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<RazorpayPaymentService> logger)
    {
        _context = context;
        _http = httpClientFactory.CreateClient("Razorpay");
        _keySecret = config["Razorpay:KeySecret"]!;
        var configured = config["Frontend:BaseUrl"];
        // Razorpay rejects localhost URLs; fall back to production URL when running in Azure
        _frontendBaseUrl = !string.IsNullOrWhiteSpace(configured) && !configured.Contains("localhost")
            ? configured
            : "https://game-hub-fullstack.vercel.app";
        _logger = logger;
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

        // Reuse this purchase's still-open Razorpay link instead of minting a
        // fresh one per retry — one purchase, one link.
        var paymentRow = await _context.Payments
            .FirstOrDefaultAsync(p => p.PurchaseId == purchase.Id);

        if (paymentRow is not null
            && paymentRow.Status == PaymentStatus.pending
            && paymentRow.RazorpayOrderId.StartsWith("plink_", StringComparison.Ordinal))
        {
            using var linkDoc = await TryFetchPaymentLinkAsync(paymentRow.RazorpayOrderId);
            if (linkDoc is not null
                && linkDoc.RootElement.TryGetProperty("status", out var st))
            {
                // Razorpay nuget shadows TryGetProperty in call chains — use two-step
                string linkStatus = st.GetString() ?? "";
                if (linkStatus is not ("expired" or "cancelled")
                    && linkDoc.RootElement.TryGetProperty("short_url", out var su)
                    && !string.IsNullOrWhiteSpace(su.GetString()))
                {
                    return new PaymentLinkInitiateDto
                    {
                        RazorpayPaymentLinkId = paymentRow.RazorpayOrderId,
                        ShortUrl = su.GetString() ?? "",
                        PurchaseId = purchase.Id,
                        OrderId = purchase.OrderId,
                        Amount = purchase.Total,
                        Currency = "INR"
                    };
                }
            }
        }


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


        var response = await _http.PostAsJsonAsync($"{RazorpayApiBaseUrl}/payment_links", payload);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Razorpay payment-link creation failed for purchase {PurchaseId}: {Body}",
                purchase.Id, responseBody);
            throw new BusinessRuleException(ExceptionMessages.PaymentLinkCreationFailed);
        }

        using var document = JsonDocument.Parse(responseBody);
        var root = document.RootElement;
        var shortUrl = root.GetProperty("short_url").GetString();
        var paymentLinkId = root.GetProperty("id").GetString();

        if (string.IsNullOrWhiteSpace(shortUrl) || string.IsNullOrWhiteSpace(paymentLinkId))
            throw new BusinessRuleException(ExceptionMessages.PaymentLinkResponseInvalid);

        // Persist the link on the purchase's single payment row so confirm-link
        // has something to validate against and retries reuse the same link.
        if (paymentRow is not null)
        {
            if (paymentRow.Status == PaymentStatus.Success)
            {
                // Money already recorded but the order is not confirmed — treat
                // as a payment/integrity mismatch and refuse to mint another link.
                throw new BusinessRuleException(ExceptionMessages.PaymentAlreadyVerified);
            }
            paymentRow.RazorpayOrderId = paymentLinkId;
            paymentRow.Amount = purchase.Total;
        }
        else
        {
            _context.Payments.Add(new Payment
            {
                PurchaseId = purchase.Id,
                RazorpayOrderId = paymentLinkId,
                Amount = purchase.Total,
                Currency = "INR",
                Status = PaymentStatus.pending
            });
        }
        await _context.SaveChangeAsync();

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
                if (payment.Purchase?.Items != null && payment.Purchase.Items.Any())
                    await PurchaseItemsToCart(payment.Purchase.Items, userId);

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

        // Cross-check with Razorpay's API — fail closed on any doubt.
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

        if (string.IsNullOrWhiteSpace(request.RazorpayPaymentLinkId)
            || string.IsNullOrWhiteSpace(request.RazorpayPaymentId))
            throw new BusinessRuleException(ExceptionMessages.PaymentNotVerified);

        var expectedAmountInPaise = (int)Math.Round(purchase.Total * 100, MidpointRounding.AwayFromZero);

        // Ask Razorpay directly — client-supplied ids are only a pointer, never proof.
        using var linkDoc = await TryFetchPaymentLinkAsync(request.RazorpayPaymentLinkId)
            ?? throw new BusinessRuleException(ExceptionMessages.PaymentNotVerified);

        var linkRoot = linkDoc.RootElement;
        var linkStatus = linkRoot.TryGetProperty("status", out var ls)
            ? (ls.GetString() ?? "")
            : "";
        if (!string.Equals(linkStatus, "paid", StringComparison.OrdinalIgnoreCase))
            throw new BusinessRuleException(ExceptionMessages.PaymentNotVerified);

        var matched = TryGetMatchingPayment(linkRoot, request.RazorpayPaymentId)
            ?? throw new BusinessRuleException(ExceptionMessages.PaymentNotVerified);

        // amount must cover the order (Razorpay payments carry integer paise)
        var actualAmountInPaise = matched.AmountPaise;
        if (actualAmountInPaise < expectedAmountInPaise)
        {
            throw new BusinessRuleException(
                string.Format(ExceptionMessages.PaymentAmountMismatch, expectedAmountInPaise, actualAmountInPaise));
        }


        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var paymentRow = await _context.Payments.FirstOrDefaultAsync(p => p.PurchaseId == purchase.Id);
            if (paymentRow is null)
            {
                paymentRow = new Payment { PurchaseId = purchase.Id };
                _context.Payments.Add(paymentRow);
            }
            paymentRow.RazorpayOrderId = request.RazorpayPaymentLinkId;
            paymentRow.RazorpayPaymentId = request.RazorpayPaymentId;
            paymentRow.Amount = purchase.Total;
            paymentRow.Currency = "INR";
            paymentRow.Status = PaymentStatus.Success;
            paymentRow.PaidAt = DateTime.UtcNow;
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

    /// <summary>
    /// GET /payment_links/{id} with one of the Razorpay-filtered factory clients.
    /// Returns null (never throws) on transport/upstream failure — callers must
    /// treat that as "not verified" (fail closed).
    /// </summary>
    private async Task<JsonDocument?> TryFetchPaymentLinkAsync(string plinkId)
    {
        try
        {
            var response = await _http.GetAsync($"{RazorpayApiBaseUrl}/payment_links/{plinkId}");
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Razorpay fetch of payment link {PlinkId} answered {Status}", plinkId, (int)response.StatusCode);
                return null;
            }
            var body = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(body);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Razorpay fetch of payment link {PlinkId} failed", plinkId);
            return null;
        }
    }

    /// <summary>Find a payment on the link matching the submitted payment id.</summary>
    private static (string Id, long AmountPaise)? TryGetMatchingPayment(JsonElement linkRoot, string paymentId)
    {
        if (!linkRoot.TryGetProperty("payments", out var payments) || payments.ValueKind != JsonValueKind.Array)
            return null;

        foreach (var p in payments.EnumerateArray())
        {
            p.TryGetProperty("id", out var pid);
            p.TryGetProperty("status", out var ps);
            string id = pid.GetString() ?? "";
            string status = ps.GetString() ?? "";
            long amount = p.TryGetProperty("amount", out var pa) && pa.ValueKind == JsonValueKind.Number
                ? pa.GetInt64() : 0L;
            if (string.Equals(id, paymentId, StringComparison.Ordinal)
                && (status == "captured" || status == "authorized")
                && amount > 0)
            {
                return (id, amount);
            }
        }
        return null;
    }

    private bool VerifySignature(string orderId, string paymentId, string signature)
    {
        string payload = $"{orderId}|{paymentId}";
        using var hmac = new System.Security.Cryptography.HMACSHA256(Encoding.UTF8.GetBytes(_keySecret));
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        string computedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
        return computedSignature == signature.ToLower();
    }

    private async Task<bool> VerifyPaymentAmountAsync(string razorpayPaymentId, int expectedAmountInPaise)
    {
        try
        {
            var response = await _http.GetAsync($"{RazorpayApiBaseUrl}/payments/{razorpayPaymentId}");
            if (!response.IsSuccessStatusCode)
                return false;

            var responseBody = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(responseBody);
            if (!document.RootElement.TryGetProperty("amount", out var amountElement))
                return false;

            var actualAmount = amountElement.GetInt32();
            return actualAmount == expectedAmountInPaise;
        }
        catch (Exception ex)
        {
            // Fail closed: if Razorpay cannot be reached the payment stays unverified.
            _logger.LogWarning(ex, "Razorpay amount verification failed for payment {PaymentId}; rejecting", razorpayPaymentId);
            return false;
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
            await PurchaseItemsToCart(purchase.Items, userId);
            await _context.SaveChangeAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Restore purchase lines into the cart, MERGING with any existing row for
    /// the same game instead of blindly adding (repeated restores no longer
    /// duplicate quantities).
    /// </summary>
    private async Task PurchaseItemsToCart(ICollection<OrderItem> items, int userId)
    {
        foreach (var item in items)
        {
            var existing = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.GameId == item.GameId);

            if (existing is not null)
            {
                existing.Quantity += item.Quantity;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
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
}
