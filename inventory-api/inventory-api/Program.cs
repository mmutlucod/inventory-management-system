using Serilog;
using inventory_api.Extensions;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/inventory-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting Inventory API...");
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();
    builder.Services.AddDatabaseConfiguration(builder.Configuration);
    builder.Services.AddRepositories();
    builder.Services.AddApplicationServices();
    builder.Services.AddAutoMapperConfiguration();

    builder.Services.AddFluentValidationConfiguration();
    builder.Services.AddJwtAuthentication(builder.Configuration);

    builder.Services.AddCorsConfiguration(builder.Configuration);
    builder.Services.AddLocalizationConfiguration();
    builder.Services.AddControllers();
    var app = builder.Build();
    app.UseSerilogRequestLogging();
    app.UseExceptionMiddleware();

    app.UseRequestLogging();

    app.UseCors("AllowSpecificOrigins");
    app.UseRequestLocalization();

    app.UseAuthentication();
    app.UseJwtMiddleware();
    app.UseAuthorization();
    app.MapControllers();

    app.MapGet("/health", () => new
    {
        status = "healthy",
        timestamp = DateTime.UtcNow,
        environment = app.Environment.EnvironmentName,
        version = "1.0.0"
    })
    .WithName("HealthCheck")
    .WithOpenApi();

    app.MapGet("/", () => new
    {
        message = "Inventory API is running",
        version = "1.0.0",
        documentation = "/swagger",
        endpoints = new
        {
            auth = "/api/auth",
            products = "/api/products",
            sync = "/api/sync",
            stockMovements = "/api/stock-movements"
        }
    })
    .WithName("Root")
    .WithOpenApi();

    Log.Information("Inventory API started successfully");
    app.Run("http://0.0.0.0:5215");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}