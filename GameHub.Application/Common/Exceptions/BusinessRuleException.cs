namespace GameHub.Application.Common.Exceptions;

public class BusinessRuleException : Exception
{
    public string? ResourceKey { get; }
    public object[]? ResourceArgs { get; }

    public BusinessRuleException(string message) : base(message) { }

    public BusinessRuleException(string message, string? resourceKey = null, params object[]? resourceArgs)
        : base(message)
    {
        ResourceKey = resourceKey;
        ResourceArgs = resourceArgs;
    }

    public BusinessRuleException(string? resourceKey, params object[]? resourceArgs)
        : base(resourceKey ?? "Business rule violated")
    {
        ResourceKey = resourceKey;
        ResourceArgs = resourceArgs;
    }
}