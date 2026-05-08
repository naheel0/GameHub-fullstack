using GameHub.Application.Common.interfaces;
using GameHub.Application.Common.Exceptions;
using GameHub.Application.DTOs.Address;
using GameHub.Application.Services;
using GameHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameHub.Infrastructure.Services
{
    public class AddressService : IAddressService
    {
        private readonly IApplicationDbContext _context;

        public AddressService(IApplicationDbContext context)
        {
            _context = context;
        }

        
        public async Task<List<AddressDto>> GetAddressesAsync(int userId)
        {
            return await _context.Address
                .Where(a => a.UserId == userId)
                .Select(a => new AddressDto
                {
                    AddressId = a.AddressId,
                    FullName = a.FullName,
                    AddressLine1 = a.AddressLine1,
                    AddressLine2 = a.AddressLine2,
                    City = a.City,
                    State = a.State,
                    ZipCode = a.ZipCode,
                    Country = a.Country,
                    Phone = a.Phone,
                    IsDefault = a.IsDefault
                })
                .ToListAsync();
        }

        
        public async Task<AddressDto> AddAddressAsync(int userId, CreateAddressRequest request)
        {
            var hasAny = await _context.Address.AnyAsync(a => a.UserId == userId);

            if (request.IsDefault)
            {
                var existingDefaults = _context.Address
                    .Where(a => a.UserId == userId && a.IsDefault);

                await existingDefaults.ForEachAsync(a => a.IsDefault = false);
            }

            var address = new Address
            {
                AddressId = Guid.NewGuid(),
                UserId = userId,

                FullName = request.FullName,
                AddressLine1 = request.AddressLine1,
                AddressLine2 = request.AddressLine2,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                Country = request.Country,
                Phone = request.Phone,

                IsDefault = request.IsDefault
            };

            _context.Address.Add(address);
            await _context.SaveChangeAsync();

            return new AddressDto
            {
                AddressId = address.AddressId,
                FullName = address.FullName,
                AddressLine1 = address.AddressLine1,
                AddressLine2 = address.AddressLine2,
                City = address.City,
                State = address.State,
                ZipCode = address.ZipCode,
                Country = address.Country,
                Phone = address.Phone,
                IsDefault = address.IsDefault
            };
        }

        
        public async Task UpdateAddressAsync(int userId, Guid addressId, UpdateAddressRequest request)
        {
            var address = await _context.Address
                .FirstOrDefaultAsync(a => a.UserId == userId && a.AddressId == addressId)
                ?? throw new NotFoundException("Address not found", "AddressNotFound");

            address.FullName = request.FullName;
            address.AddressLine1 = request.AddressLine1;
            address.AddressLine2 = request.AddressLine2;
            address.City = request.City;
            address.State = request.State;
            address.ZipCode = request.ZipCode;
            address.Country = request.Country;
            address.Phone = request.Phone;

            if (request.IsDefault && !address.IsDefault)
            {
                var others = _context.Address
                    .Where(a => a.UserId == userId && a.IsDefault);

                await others.ForEachAsync(a => a.IsDefault = false);

                address.IsDefault = true;
            }

            await _context.SaveChangeAsync();
        }

                public async Task DeleteAddressAsync(int userId, Guid addressId)
        {
            var address = await _context.Address
                .FirstOrDefaultAsync(a => a.UserId == userId && a.AddressId == addressId);

            if (address == null)
                return;

            var wasDefault = address.IsDefault;

            _context.Address.Remove(address);
            await _context.SaveChangeAsync();

            if (wasDefault)
            {
                var newDefault = await _context.Address
                    .Where(a => a.UserId == userId)
                    .FirstOrDefaultAsync();

                if (newDefault != null)
                {
                    newDefault.IsDefault = true;
                    await _context.SaveChangeAsync();
                }
            }
        }


        public async Task SetDefaultAsync(int userId, Guid addressId)
        {
            var addresses = _context.Address
                .Where(a => a.UserId == userId);

            await addresses.ForEachAsync(a => a.IsDefault = false);

            var address = await _context.Address
                .FirstOrDefaultAsync(a => a.UserId == userId && a.AddressId == addressId)
                ?? throw new NotFoundException("Address not found", "AddressNotFound");

            address.IsDefault = true;

            await _context.SaveChangeAsync();
        }
    }
}