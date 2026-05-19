using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Admin;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GameHub.Infrastructure.Data
{
    public class AppDbContext : DbContext, IApplicationDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Address> Address { get; set; }
        public DbSet<Purchase> Purchases { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<CardDetail> CardDetails { get; set; }
        // Keyless DbQuery for mapping stored-proc result
        public DbSet<AdminUserDetailDto> AdminUserDetails { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<BlacklistedToken> BlacklistedTokens { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

            var stringListComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1.SequenceEqual(c2),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v != null ? v.GetHashCode() : 0)),
                c => c.ToList());
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
                entity.HasQueryFilter(u => !u.IsDeleted);
            });
            //-----------GAMES--------------
            modelBuilder.Entity<Game>(entity =>
            {
                entity.Property(g => g.Name).HasMaxLength(200).IsRequired();
                entity.Property(g => g.Genre).HasMaxLength(100);
                entity.Property(g => g.Platform).HasMaxLength(100);
                entity.Property(g => g.Price).HasColumnType("decimal(10,2)");
                entity.Property(g => g.Trailer).HasMaxLength(500);
                entity.Property(g => g.Image)
                      .HasConversion(
                          v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                          v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new())
                      .HasColumnType("nvarchar(max)")
                      .Metadata.SetValueComparer(stringListComparer);
                entity.Property(g => g.Rating).HasDefaultValue(0);
                entity.HasQueryFilter(g => !g.IsDeleted);
            });
            modelBuilder.Entity<Address>(entity =>
            {
                entity.HasKey(a => a.AddressId);

                entity.Property(a => a.FullName).HasMaxLength(100);
                entity.Property(a => a.AddressLine1).HasMaxLength(100);
                entity.Property(a => a.AddressLine2).HasMaxLength(100);
                entity.Property(a => a.City).HasMaxLength(100);
                entity.Property(a => a.State).HasMaxLength(100);
                entity.Property(a => a.Country).HasMaxLength(100);
                entity.Property(a => a.ZipCode).HasMaxLength(10);
                entity.Property(a => a.Phone).HasMaxLength(15);

                entity.HasOne(a => a.User)
                      .WithMany(u => u.Addresses)
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<CardDetail>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.CardNumber).HasMaxLength(25).IsRequired();
                entity.Property(c => c.ExpiryDate).HasMaxLength(10).IsRequired();
                entity.Property(c => c.Cvv).HasMaxLength(4).IsRequired();
                entity.Property(c => c.CardholderName).HasMaxLength(100).IsRequired();

                entity.HasOne(c => c.User)
                      .WithMany(u => u.CardDetails)
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            //-------------PURCHASE---------------
            modelBuilder.Entity<Purchase>(entity =>
            {
                entity.ToTable("Purchases");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.OrderId).HasMaxLength(20).IsRequired();
                entity.Property(p => p.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20);
                entity.Property(p => p.PaymentMethod)
                    .HasConversion<string>()
                    .HasMaxLength(20);
                entity.Property(p => p.SubTotal).HasColumnType("decimal(10,2)");
                entity.Property(p => p.Tax).HasColumnType("decimal(10,2)");
                entity.Property(p => p.Total).HasColumnType("decimal(10,2)");

                entity.HasOne(p => p.user)
          .WithMany(u => u.PurchaseHistory)
          .HasForeignKey(p => p.UserId)
          .OnDelete(DeleteBehavior.Cascade);

                // Shipping address JSON column
                entity.OwnsOne(p => p.ShippingAddress, addr =>
                {
                    addr.ToJson("ShippingAddress");
                    addr.Property(a => a.FullName).HasMaxLength(100);
                    addr.Property(a => a.Country).HasMaxLength(200);
                    addr.Property(a => a.City).HasMaxLength(100);
                    addr.Property(a => a.State).HasMaxLength(100);
                    addr.Property(a => a.ZipCode).HasMaxLength(10);
                    addr.Property(a => a.Phone).HasMaxLength(15);
                });

                // ----------CART----------------
                modelBuilder.Entity<CartItem>(ci =>
                {
                    ci.ToTable("CartItems");
                    ci.HasKey(c => c.Id);
                    ci.Property(c => c.GameName).HasMaxLength(200);
                    ci.Property(c => c.Image)
                      .HasConversion(
                          v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                          v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new())
                      .HasColumnType("nvarchar(max)")
                      .Metadata.SetValueComparer(stringListComparer);
                    ci.Property(c => c.Price).HasColumnType("decimal(10,2)");
                    ci.HasOne(c => c.User)
                      .WithMany(u => u.CartItems)
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                });

                // ------------WISHLIST-------------
                modelBuilder.Entity<WishlistItem>(wi =>
                {
                    wi.ToTable("WishlistItems");
                    wi.HasKey(w => w.Id);
                    wi.Property(w => w.GameName).HasMaxLength(200);
                    wi.Property(w => w.ImageUrl).HasMaxLength(500);
                    wi.Property(w => w.Price).HasColumnType("decimal(10,2)");
                    wi.HasOne(w => w.User)
                      .WithMany(u => u.WishlistItems)
                      .HasForeignKey(w => w.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                });

                modelBuilder.Entity<BlacklistedToken>(entity =>
                {
                    entity.HasKey(b => b.Id);
                    entity.Property(b => b.Jti).IsRequired().HasMaxLength(200);
                    entity.Property(b => b.Expires).IsRequired();
                });

            // Keyless mapping for AdminUserDetailDto used by FromSqlRaw
            modelBuilder.Entity<AdminUserDetailDto>(eb =>
            {
                eb.HasNoKey();
                eb.ToView(null);
            });

                //-----------------------Razorpay-----------------------------------//
                modelBuilder.Entity<Payment>(entity =>
                {
                    entity.ToTable("Payments");
                    entity.HasKey(p => p.Id);
                    entity.Property(p => p.RazorpayOrderId).HasMaxLength(50).IsRequired();
                    entity.Property(p => p.RazorpayPaymentId).HasMaxLength(50);
                    entity.Property(p => p.RazorpaySignature).HasMaxLength(200);
                    entity.Property(p => p.Currency).HasMaxLength(3);
                    entity.Property(p => p.Amount).HasColumnType("decimal(10,2)");

                                        entity.HasOne(p => p.Purchase)
                                            .WithOne(p => p.Payment)
                                            .HasForeignKey<Payment>(p => p.PurchaseId)
                      .OnDelete(DeleteBehavior.Cascade);
                });
            });

        }

        public Task<int> SaveChangeAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
