using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using GameHub.Application.Common.interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace GameHub.Infrastructure.Data
{
    public class AppDbContext : DbContext, IApplicationDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<User> Users { get; set; }
        //public DbSet<Game> Games { get; set; }
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

        }

        public Task<int> SaveChangeAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
