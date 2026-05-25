using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using GameHub.Application.Common.Interfaces;
using GameHub.Application.Resources;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace GameHub.Infrastructure.Services
{

    public class CloudinaryStorageService : IFileStorageService
    {
        private readonly Cloudinary _cloudinary;
        public CloudinaryStorageService(IConfiguration config)
        {

            string? cloudName = config["Cloudinary:CloudName"] ?? config["CloudinarySettings:CloudName"];
            string? apiKey = config["Cloudinary:ApiKey"] ?? config["CloudinarySettings:ApiKey"];
            string? apiSecret = config["Cloudinary:ApiSecret"] ?? config["CloudinarySettings:ApiSecret"];

            if (string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
            {
                throw new ArgumentException(ExceptionMessages.CloudinaryConfigurationMissing);
            }

            var account = new Account(cloudName.Trim(), apiKey.Trim(), apiSecret.Trim());
            _cloudinary = new Cloudinary(account);
        }
        public async Task<string> UploadImageAsync(IFormFile file)
        {
            return await UploadImageInternalAsync(file, "gamehub/images");
        }

        public async Task<string> UploadVideoAsync(IFormFile file)
        {
            return await UploadVideoInternalAsync(file, "gamehub/videos");
        }

        private async Task<string> UploadImageInternalAsync(IFormFile file, string folder)
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder
            };
            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result.Error != null)
                throw new Exception(string.Format(ExceptionMessages.CloudinaryUploadFailed, result.Error.Message));
            return result.SecureUrl.ToString();
        }

        private async Task<string> UploadVideoInternalAsync(IFormFile file, string folder)
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder
            };
            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result.Error != null)
                throw new Exception(string.Format(ExceptionMessages.CloudinaryUploadFailed, result.Error.Message));
            return result.SecureUrl.ToString();
        }
    }
}
