namespace GameHub.Application.DTOs.Payments
{
    public class PaymentVerifyRequest
    {
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
        public int? Amount { get; set; }
    }
}
