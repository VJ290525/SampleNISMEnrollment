using Enrollment.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Enrollment.Api.Tests;

public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string database = $"NismEnrollmentTests_{Guid.NewGuid():N}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureLogging(logging => logging.ClearProviders());
        builder.ConfigureServices(services => {
            services.RemoveAll<DbContextOptions<EnrollmentDbContext>>();
            services.AddDbContext<EnrollmentDbContext>(options => options.UseSqlServer(
                $"Server=(localdb)\\MSSQLLocalDB;Database={database};Trusted_Connection=True;TrustServerCertificate=True"));
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        await DatabaseInitializer.InitializeAsync(scope.ServiceProvider.GetRequiredService<EnrollmentDbContext>(), CancellationToken.None);
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<EnrollmentDbContext>().Database.EnsureDeletedAsync();
        await DisposeAsync();
    }
}
