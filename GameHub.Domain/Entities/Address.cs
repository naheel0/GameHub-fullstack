namespace GameHub.Domain.Entities
{
    public class Address
    {
        public Guid AddressId { get; set; } =Guid.NewGuid();
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public string FullName { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = true;
    }
}
