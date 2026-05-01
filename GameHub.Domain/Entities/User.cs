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
    }
}
