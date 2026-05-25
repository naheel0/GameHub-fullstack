namespace GameHub.Application.DTOs.Payments
{
    public class PaymentVerificationDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int PurchaseId { get; set; }
        public Guid OrderId { get; set; }

    }
}
