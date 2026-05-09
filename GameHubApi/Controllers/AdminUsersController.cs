using GameHub.Application.Common.Models;
using GameHub.Application.DTOs.Admin;
using GameHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameHubApi.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IAdminService _adminService;
        public AdminUsersController(IAdminService adminService)
        {
            _adminService = adminService;
        }
        [HttpGet]
        public async Task<IActionResult> GetUser([FromQuery] QueryParameters queryParams)
        {
            var result = await _adminService.GetUsersAsync(queryParams);
            Response.Headers["X-otal-Count"] = result.TotalCount.ToString();
            return Ok(result.Items);
        }
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserDetail(int Id)
        {
            var user = await _adminService.GetUserDetailAsync(Id);
            if (user == null) return NotFound(new { message = "User not found" });
            return Ok(user);
        }
        [HttpPut("{id:int}/block")]
        public async Task<IActionResult> BlockUser(int Id)
        {
            await _adminService.BlockUserAsync(Id);
            return Ok(new { message = "User blocked successFully" });
        }
        [HttpPut("{id:int}/activate")]
        public async Task<IActionResult> ActivateUser(int Id)
        {
            await _adminService.ActivateUserAsync(Id);
            return Ok(new { message = "User activated successfully" });
        }
        [HttpPut("{id:int}/role")]
        public async Task<IActionResult> UpdateRole(int Id, [FromBody] UpdateUserRoleRequest request)
        {
            await _adminService.UpdateUserRoleAsync(Id, request.Role);
            return Ok(new { message = "Role update successfully" });
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUser(int Id)
        {
            await _adminService.DeleteUserAsync(Id);
            return NoContent();
        }
    }
}
