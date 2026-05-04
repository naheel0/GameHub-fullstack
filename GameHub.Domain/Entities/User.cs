using GameHub.Domain.Enums;

namespace GameHub.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; }
        public string Email { get; set; }= string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Role Role { get; set; } = Role.User;
        public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
        public List<RefreshToken> RefreshTokens { get; set; }
        public List<CartItem> CartItems { get; set; } = new();
        public List<WishlistItem> WishlistItems { get; set; } = new();
        public ICollection<Address> Addresses { get; set; } = new List<Address>();
        public IList<Purchase> PurchaseHistory { get; set; } = new List<Purchase>();
    }
}
