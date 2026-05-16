namespace GameHub.Application.DTOs.CardDetails
{
    public class CardDetailDto
    {
        public int Id { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string Cvv { get; set; } = string.Empty;
        public string CardholderName { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
