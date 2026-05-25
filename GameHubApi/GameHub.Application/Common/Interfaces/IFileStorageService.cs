using Microsoft.AspNetCore.Http;
namespace GameHub.Application.Common.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> UploadVideoAsync(IFormFile file);
        Task<string> UploadImageAsync(IFormFile file);
    }
}
