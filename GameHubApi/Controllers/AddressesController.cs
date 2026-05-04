using GameHub.Application.Common.interfaces;
using GameHub.Application.DTOs.Address;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        public async Task<IActionResult> AddAddress()
        {
            var addresses = await _addressService.GetAddressesAsync(_currentUserService.UserId!.Value);
            return Ok(addresses);
        }
        [HttpPost]
        public async Task<IActionResult> AddAddress(CreateAddressRequest request)
        {
            var result = await _addressService.AddAddressAsync(_currentUserService.UserId!.Value, request);
            return Ok(result);
        }
        [HttpPut("{addressId}")]
        public async Task<IActionResult> UpdateAddress(Guid addressId, UpdateAddressRequest request)
        {
            await _addressService.UpdateAddressAsync(_currentUserService.UserId!.Value, addressId, request);
            return Ok(new { message = "Address updated" });
        }
        [HttpDelete("{addressId}")]
        public async Task<IActionResult> DeleteAddress(Guid addressId)
        {
            await _addressService.DeleteAddressAsync(_currentUserService.UserId!.Value, addressId);
            return Ok(new { message = "Address delete" });
        }
        [HttpPut("{addressId}/default")]
        public async Task<IActionResult> SetDefault(Guid addressId)
        {
            await _addressService.SetDefaultAsync(_currentUserService.UserId!.Value, addressId);
            return Ok(new { message = "Default address update" });
        }
    }
}