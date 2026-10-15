using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Enrollment.Api.Data;
using Enrollment.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Enrollment.Api.Tests;

public sealed class WorkflowTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient client = factory.CreateClient();

    private async Task<JsonElement> Create(string route, object body)
    {
        var response = await client.PostAsJsonAsync(route, body);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    private Task<JsonElement> Profile() => Create("/api/profiles", new {
        fullName = "Integration Candidate", email = $"{Guid.NewGuid():N}@example.test", phone = "+91 9876543210", centre = "Mumbai"
    });

    private async Task<JsonElement> ApprovedProfile()
    {
        var profile = await Profile();
        var response = await client.PostAsJsonAsync($"/api/profiles/{profile.GetProperty("id")}/review", new {
            status = "Approved", version = profile.GetProperty("version").GetString(), reason = "Integration check"
        });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    [Fact]
    public async Task AddExamProfileAndEnrollmentPersistAcrossRequests()
    {
        var code = $"T-{Guid.NewGuid():N}"[..25];
        var exam = await Create("/api/exams", new { code, name = code, description = "Created by integration test" });
        var profile = await ApprovedProfile();
        var enrollment = await Create("/api/enrollments", new { profileId = profile.GetProperty("id").GetInt32(), examId = exam.GetProperty("id").GetInt32(), centre = "Mumbai" });
        var rows = await client.GetFromJsonAsync<JsonElement>("/api/enrollments");
        Assert.Contains(rows.EnumerateArray(), row => row.GetProperty("id").GetInt32() == enrollment.GetProperty("id").GetInt32());
        var duplicate = await client.PostAsJsonAsync("/api/enrollments", new { profileId = profile.GetProperty("id").GetInt32(), examId = exam.GetProperty("id").GetInt32(), centre = "Mumbai" });
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task DuplicateEmailsAndExamCodesAreRejectedAfterNormalization()
    {
        var profile = await Profile();
        var response = await client.PostAsJsonAsync("/api/profiles", new { fullName = "Duplicate", email = profile.GetProperty("email").GetString()!.ToUpperInvariant(), phone = "9876543210", centre = "Pune" });
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var code = $"T-{Guid.NewGuid():N}"[..25];
        await Create("/api/exams", new { code, name = code });
        response = await client.PostAsJsonAsync("/api/exams", new { code = code.ToLowerInvariant(), name = "Another name" });
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task ValidationRejectsMissingFieldsAndUnknownRelationships()
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/profiles", new { fullName = " ", email = "invalid", phone = "abc", centre = "" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/exams", new { code = "", name = "" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/enrollments", new { profileId = int.MaxValue, examId = int.MaxValue, centre = "Mumbai" })).StatusCode);
    }

    [Fact]
    public async Task PendingProfilesCannotEnrollAndReviewsRequireCurrentVersionAndReason()
    {
        var profile = await Profile(); var id = profile.GetProperty("id").GetInt32();
        var exam = (await client.GetFromJsonAsync<JsonElement>("/api/exams"))[0].GetProperty("id").GetInt32();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/enrollments", new { profileId = id, examId = exam, centre = "Mumbai" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync($"/api/profiles/{id}/review", new { status = "Rejected", version = profile.GetProperty("version").GetString(), reason = " " })).StatusCode);
        var decision = new { status = "Approved", version = profile.GetProperty("version").GetString(), reason = "Checked" };
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync($"/api/profiles/{id}/review", decision)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync($"/api/profiles/{id}/review", decision)).StatusCode);
        using var scope = factory.Services.CreateScope();
        Assert.Equal(1, await scope.ServiceProvider.GetRequiredService<EnrollmentDbContext>().Reviews.CountAsync(r => r.ProfileId == id));
    }

    [Fact]
    public async Task LastSeatCannotBeOversoldByConcurrentEnrollments()
    {
        var first = await ApprovedProfile(); var second = await ApprovedProfile();
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EnrollmentDbContext>();
        var exam = await db.Exams.FirstAsync();
        var session = new ExamSession { ExamId = exam.Id, Centre = "Mumbai", StartsAt = DateTimeOffset.UtcNow.AddDays(10), Capacity = 1 };
        db.Sessions.Add(session); await db.SaveChangesAsync();
        var results = await Task.WhenAll(new[] { first, second }.Select(profile => client.PostAsJsonAsync("/api/enrollments", new {
            profileId = profile.GetProperty("id").GetInt32(), examId = exam.Id, sessionId = session.Id, centre = "Mumbai"
        })));
        Assert.Single(results, r => r.StatusCode == HttpStatusCode.Created);
        Assert.Single(results, r => r.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal(1, await db.Enrollments.CountAsync(e => e.SessionId == session.Id));
        var sessions = await client.GetFromJsonAsync<JsonElement>("/api/sessions");
        Assert.Equal(0, sessions.EnumerateArray().Single(s => s.GetProperty("id").GetInt32() == session.Id).GetProperty("availableSeats").GetInt32());
    }
}
