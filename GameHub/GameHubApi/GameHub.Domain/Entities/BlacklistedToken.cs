using System;

namespace GameHub.Domain.Entities
{
    public class BlacklistedToken
    {
        public int Id { get; set; }
        public string Jti { get; set; } = string.Empty;
        public DateTime Expires { get; set; }
    }
}
