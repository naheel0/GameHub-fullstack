namespace GameHub.Application.DTOs.Payments
{
    public class PaymentLinkConfirmRequest
    {
        public int PurchaseId { get; set; }
        public string RazorpayPaymentLinkId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
    }
}
