using inventory_api.Middleware;
namespace inventory_api.Extensions;


public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
    {
        app.UseMiddleware<ExceptionMiddleware>();
        return app;
    }


    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder app)
    {
        app.UseMiddleware<RequestLoggingMiddleware>();
        return app;
    }

    public static IApplicationBuilder UseJwtMiddleware(this IApplicationBuilder app)
    {
        app.UseMiddleware<JwtMiddleware>();
        return app;
    }

}