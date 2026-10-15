using Enrollment.Api.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true).AddEnvironmentVariables();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<EnrollmentDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("EnrollmentDatabase")));
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173").AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseExceptionHandler();
app.Use(async (context, next) => {
    try { await next(context); }
    catch (DbUpdateConcurrencyException) {
        await Results.Problem(statusCode: 409, title: "This record changed. Refresh and try again.").ExecuteAsync(context);
    }
    catch (Exception ex) when (ContainsSqlError(ex, 1205)) {
        await Results.Problem(statusCode: 409, title: "Another booking changed availability. Refresh and retry.").ExecuteAsync(context);
    }
    catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2601 or 2627 }) {
        await Results.Problem(statusCode: 409, title: "A record with these details already exists.").ExecuteAsync(context);
    }
    catch (Exception ex) when (ex is SqlException || ex is DbUpdateException) {
        app.Logger.LogError(ex, "Database request failed. Trace {TraceId}", context.TraceIdentifier);
        await Results.Problem(statusCode: 503, title: "The database is unavailable. Please retry.").ExecuteAsync(context);
    }
});
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "running" }));
app.MapFallbackToFile("index.html");
if (builder.Configuration.GetValue<bool>("Database:Initialize")) {
    using var scope = app.Services.CreateScope();
    await DatabaseInitializer.InitializeAsync(scope.ServiceProvider.GetRequiredService<EnrollmentDbContext>(), app.Lifetime.ApplicationStopping);
}
app.Run();

static bool ContainsSqlError(Exception exception, int number)
{
    for (Exception? current = exception; current is not null; current = current.InnerException)
        if (current is SqlException sql && sql.Number == number) return true;
    return false;
}

public partial class Program;
