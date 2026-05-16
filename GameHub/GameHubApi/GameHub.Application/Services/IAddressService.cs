using GameHub.Application.DTOs.Address;

namespace GameHub.Application.Services
{
    public interface IAddressService
    {
        Task<List<AddressDto>> GetAddressesAsync(int userId);
        Task<AddressDto> AddAddressAsync(int userId, CreateAddressRequest request);
        Task UpdateAddressAsync(int userId, Guid addressId, UpdateAddressRequest request);
        Task DeleteAddressAsync(int userId, Guid addressId);
        Task SetDefaultAsync(int userId, Guid addressId);
    }
}
