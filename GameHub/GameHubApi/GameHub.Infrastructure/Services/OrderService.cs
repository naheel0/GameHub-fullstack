using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Address;
using GameHub.Application.DTOs.Orders;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using GameHub.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;

    public OrderService(IApplicationDbContext context) => _context = context;

    public async Task<OrderDto> PlaceOrderAsync(int userId, PlaceOrderRequest request)
    {
        _ = await _context.Users.FindAsync(userId)
            ?? throw new NotFoundException(nameof(ExceptionMessages.UserNotFound));

        var cartItems = await _context.CartItems
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any())
            throw new BusinessRuleException(nameof(ExceptionMessages.CartEmpty));

        var address = await _context.Address
            .FirstOrDefaultAsync(a => a.AddressId == request.AddressId && a.UserId == userId)
            ?? throw new NotFoundException(nameof(ExceptionMessages.AddressNotFoundOrDoesNotBelong));


        var gameIds = cartItems.Select(ci => ci.GameId).Distinct();
        var games = await _context.Games
            .Where(g => gameIds.Contains(g.Id))
            .ToDictionaryAsync(g => g.Id);

        foreach (var cartItem in cartItems)
        {
            if (!games.TryGetValue(cartItem.GameId, out var game) || !game.InStock)
                throw new BusinessRuleException(nameof(ExceptionMessages.GameNoLongerAvailable), cartItem.GameName);
        }

        decimal subtotal = cartItems.Sum(ci => ci.Price * ci.Quantity);
        decimal tax = Math.Round(subtotal * 0.1m, 2);
        decimal total = subtotal + tax;

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var purchase = new Purchase
            {
                UserId = userId,
                // Enforce Razorpay as the only supported payment method server-side
                PaymentMethod = GameHub.Domain.Enums.PaymentMethod.Razorpay,
                Status = OrderStatus.Pending,
                SubTotal = subtotal,
                Tax = tax,
                Total = total,
                ShippingAddress = new PurchaseShippingAddress
                {
                    AddressId = address.AddressId,
                    FullName = address.FullName,
                    AddressLine1 = address.AddressLine1,
                    AddressLine2 = address.AddressLine2,
                    City = address.City,
                    State = address.State,
                    ZipCode = address.ZipCode,
                    Country = address.Country,
                    Phone = address.Phone
                }
            };

            purchase.Items = cartItems.Select(ci => new OrderItem
            {
                GameId = ci.GameId,
                GameName = ci.GameName,
                Price = ci.Price,
                Quantity = ci.Quantity
            }).ToList();

            _context.Purchases.Add(purchase);
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangeAsync();
            await transaction.CommitAsync();

            return MapOrderToDto(purchase);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<OrderDto>> GetOrderHistoryAsync(int userId)
    {
        var orders = await _context.Purchases
            .Where(p => p.UserId == userId)
            .Include(p => p.Items)
            .Include(p => p.ShippingAddress)
            .AsNoTracking()
            .OrderByDescending(p => p.OrderDate)
            .ToListAsync();

        return orders.Select(MapOrderToDto).ToList();
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int userId, Guid orderId)
    {
        var order = await _context.Purchases
            .Include(p => p.Items)
            .Include(p => p.ShippingAddress)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.OrderId == orderId);

        return order is not null ? MapOrderToDto(order) : null;
    }

    private static OrderDto MapOrderToDto(Purchase p) => new()
    {
        PurchaseId = p.Id,
        OrderId = p.OrderId,
        OrderDate = p.OrderDate,
        Items = p.Items.Select(i => new OrderItemDto
        {
            GameId = i.GameId,
            GameName = i.GameName,
            Price = i.Price,
            Quantity = i.Quantity
        }).ToList(),
        SubTotal = p.SubTotal,
        Tax = p.Tax,
        Total = p.Total,
        ShippingAddress = new AddressDto
        {
            AddressId = p.ShippingAddress.AddressId,
            FullName = p.ShippingAddress.FullName,
            AddressLine1 = p.ShippingAddress.AddressLine1,
            AddressLine2 = p.ShippingAddress.AddressLine2,
            City = p.ShippingAddress.City,
            State = p.ShippingAddress.State,
            ZipCode = p.ShippingAddress.ZipCode,
            Country = p.ShippingAddress.Country,
            Phone = p.ShippingAddress.Phone
        },
        PaymentMethod = p.PaymentMethod.ToString(),
        Status = p.Status.ToString()
    };
}