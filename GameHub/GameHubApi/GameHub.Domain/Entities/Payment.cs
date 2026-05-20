using GameHub.Domain.Enums;

namespace GameHub.Domain.Entities
{
    public class Payment
    {
        public int Id { get; set; }
        public int PurchaseId { get; set; }
        public Purchase Purchase { get; set; } = null;
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public PaymentStatus Status { get; set; } = PaymentStatus.pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime PaidAt { get; set; }
    }
}
