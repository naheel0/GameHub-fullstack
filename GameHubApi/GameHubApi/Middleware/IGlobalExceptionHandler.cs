namespace GameHubApi.Middleware;

public interface IGlobalExceptionHandler
{
    (int Status, string Message, string ErrorCode) Handle(Exception ex);
}
