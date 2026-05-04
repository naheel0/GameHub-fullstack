using GameHub.Application.Common.Exceptions;
using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Address;
using GameHub.Application.DTOs.Orders;
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
        // Fetch user (needed for cart)
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        // Fetch the address from the new Addresses table
        var address = await _context.Address
            .FirstOrDefaultAsync(a => a.AddressId == request.AddressId && a.UserId == userId)
            ?? throw new KeyNotFoundException("Address not found or does not belong to user");

        if (!user.CartItems.Any())
            throw new BusinessRuleException("Cart is empty");

        // Validate stock for all cart items
        foreach (var cartItem in user.CartItems)
        {
            var game = await _context.Games.FindAsync(cartItem.GameId);
            if (game == null || !game.InStock)
                throw new BusinessRuleException($"Game '{cartItem.GameName}' is no longer available");
        }

        // Calculate totals (10% tax)
        decimal subtotal = user.CartItems.Sum(ci => ci.Price * ci.Quantity);
        decimal tax = Math.Round(subtotal * 0.1m, 2);
        decimal total = subtotal + tax;

        var purchase = new Purchase
        {
            UserId = userId,
            PaymentMethod = request.PaymentMethod,
            Status = OrderStatus.Pending,
            SubTotal = subtotal,
            Tax = tax,
            Total = total,
            // Snapshotted address
            ShippingAddress = new PurchaseShippingAddress
            {
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

        // Build order items from cart
        purchase.Items = user.CartItems.Select(ci => new OrderItem
        {
            GameId = ci.GameId,
            GameName = ci.GameName,
            Price = ci.Price,
            Quantity = ci.Quantity
        }).ToList();

        _context.Purchases.Add(purchase);
        user.CartItems.Clear();   // clear cart after order

        await _context.SaveChangeAsync();

        return MapOrderToDto(purchase);
    }

    public async Task<List<OrderDto>> GetOrderHistoryAsync(int userId)
    {
        var orders = await _context.Purchases
            .Where(p => p.UserId == userId)
            .Include(p => p.Items)
            .AsNoTracking()
            .OrderByDescending(p => p.OrderDate)
            .ToListAsync();

        return orders.Select(MapOrderToDto).ToList();
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int userId, Guid orderId)
    {
        var order = await _context.Purchases
            .Include(p => p.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.OrderId == orderId);

        return order != null ? MapOrderToDto(order) : null;
    }

    private static OrderDto MapOrderToDto(Purchase p) => new()
    {
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