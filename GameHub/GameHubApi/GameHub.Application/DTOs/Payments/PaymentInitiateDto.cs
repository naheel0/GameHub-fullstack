namespace GameHub.Application.DTOs.Payments
{
    public class PaymentInitiateDto
    {
        public string RazorpayOrderId { get; set; } = string.Empty;
        public int PurchaseId { get; set; }
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
    }
}
