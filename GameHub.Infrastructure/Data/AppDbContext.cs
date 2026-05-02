using GameHub.Application.Common.interfaces;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Infrastructure.Data
{
    public class AppDbContext : DbContext, IApplicationDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Game> Games { get; set; }
        //public DbSet<Address> Address { get; set; }
        //public DbSet<CartItem> CartItems { get; set; }
        //public DbSet<WishlistItem> WishItems { get; set; }
        //public DbSet<Purchase> Purchase { get; set; }
        //public DbSet<PurchaseItem> PurchaseItems { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);
            //------REFRESH TOKEN-------
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            //-------------USER-----------
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.FirstName).HasMaxLength(50);
                entity.Property(u => u.LastName).HasMaxLength(50);
                entity.Property(u => u.Phone).HasMaxLength(15);
                entity.Property(u => u.PasswordHash).IsRequired();
            });
            //-----------GAMES--------------
            modelBuilder.Entity<Game>(entity =>
            {
                entity.Property(g => g.Name).HasMaxLength(200).IsRequired();
                entity.Property(g => g.Genre).HasMaxLength(100);
                entity.Property(g => g.Platform).HasMaxLength(100);
                entity.Property(g => g.Price).HasColumnType("decimal(10,2)");
                entity.Property(g => g.Trailer).HasMaxLength(500);
                // ImageUrls will be a JSON column
                entity.Property(g => g.Image)
                      .HasConversion(
                          v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                          v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new())
                      .HasColumnType("nvarchar(max)");
                entity.Property(g => g.Rating).HasDefaultValue(0);
            });

        }

        public Task<int> SaveChangeAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
