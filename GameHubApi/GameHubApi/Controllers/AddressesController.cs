using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Address;
using GameHub.Application.Resources;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AddressesController : ControllerBase
    {
        private readonly IAddressService _addressService;
        private readonly ICurrentUserService _currentUserService;
        public AddressesController(IAddressService addressService, ICurrentUserService currentUserService)
        {
            _addressService = addressService;
            _currentUserService = currentUserService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAddresses()
        {
            var userId = GetCurrentUserId();
            var addresses = await _addressService.GetAddressesAsync(userId);
            return Ok(addresses);
        }
        [HttpPost]
        public async Task<IActionResult> AddAddress(CreateAddressRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _addressService.AddAddressAsync(userId, request);
            return Ok(result);
        }
        [HttpPut("{addressId}")]
        public async Task<IActionResult> UpdateAddress(Guid addressId, UpdateAddressRequest request)
        {
            var userId = GetCurrentUserId();
            await _addressService.UpdateAddressAsync(userId, addressId, request);
            return Ok(new { message = ExceptionMessages.AddressUpdated });
        }
        [HttpDelete("{addressId}")]
        public async Task<IActionResult> DeleteAddress(Guid addressId)
        {
            var userId = GetCurrentUserId();
            await _addressService.DeleteAddressAsync(userId, addressId);
            return Ok(new { message = ExceptionMessages.AddressDeleted });
        }
        [HttpPut("{addressId}/default")]
        public async Task<IActionResult> SetDefault(Guid addressId)
        {
            var userId = GetCurrentUserId();
            await _addressService.SetDefaultAsync(userId, addressId);
            return Ok(new { message = ExceptionMessages.DefaultAddressUpdated });
        }

        private int GetCurrentUserId()
        {
            return _currentUserService.UserId
                ?? throw new UnauthorizedAccessException(ExceptionMessages.Unauthorized);
        }
    }
}