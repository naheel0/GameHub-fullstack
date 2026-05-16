namespace GameHub.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public string? ResourceKey { get; }
    public object[]? ResourceArgs { get; }

    public NotFoundException(string message) : base(message) { }

    public NotFoundException(string message, string? resourceKey = null, params object[]? resourceArgs)
        : base(message)
    {
        ResourceKey = resourceKey;
        ResourceArgs = resourceArgs;
    }

    public NotFoundException(string? resourceKey, params object[]? resourceArgs)
        : base(resourceKey ?? "Resource not found")
    {
        ResourceKey = resourceKey;
        ResourceArgs = resourceArgs;
    }
}
