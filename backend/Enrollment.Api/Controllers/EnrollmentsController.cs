using System.Data;
using Enrollment.Api.Contracts;
using Enrollment.Api.Data;
using Enrollment.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Enrollment.Api.Controllers;

[ApiController, Route("api/enrollments")]
public sealed class EnrollmentsController(EnrollmentDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken token) => Ok(await db.Enrollments.AsNoTracking()
        .OrderByDescending(x => x.CreatedAt).Select(x => new {
            x.Id, x.Reference, x.ProfileId, ProfileName = x.Profile.FullName, x.ExamId, ExamName = x.Exam.Name,
            x.SessionId, x.Centre, x.Status, x.CreatedAt
        }).ToListAsync(token));

    [HttpPost]
    public async Task<IActionResult> Create(CreateEnrollmentRequest input, CancellationToken token)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, token);
        var profile = await db.Profiles.FindAsync([input.ProfileId], token);
        if (profile is null) return Problem(statusCode: 400, title: "Select an existing profile.");
        if (profile.Status != "Approved") return Problem(statusCode: 400, title: "Approve the profile before enrolling.");
        if (!await db.Exams.AnyAsync(x => x.Id == input.ExamId, token))
            return Problem(statusCode: 400, title: "Select an existing exam.");
        if (await db.Enrollments.AnyAsync(x => x.ProfileId == input.ProfileId && x.ExamId == input.ExamId, token))
            return Problem(statusCode: 409, title: "This candidate is already enrolled in this exam.");
        var centre = input.Centre.Trim();
        if (input.SessionId is int sessionId) {
            var session = await db.Sessions.FindAsync([sessionId], token);
            if (session is null || session.ExamId != input.ExamId)
                return Problem(statusCode: 400, title: "The session does not belong to this exam.");
            if (!session.BookingOpen || session.StartsAt <= DateTimeOffset.UtcNow)
                return Problem(statusCode: 409, title: "Booking for this session is closed.");
            var booked = await db.Enrollments.CountAsync(x => x.SessionId == sessionId && x.Status == "Confirmed", token);
            if (booked + session.HeldSeats >= session.Capacity)
                return Problem(statusCode: 409, title: "This session is full. Choose another session.");
            centre = session.Centre;
        }
        var enrollment = new CandidateEnrollment {
            ProfileId = input.ProfileId, ExamId = input.ExamId, SessionId = input.SessionId, Centre = centre
        };
        db.Enrollments.Add(enrollment);
        await db.SaveChangesAsync(token);
        await transaction.CommitAsync(token);
        return Created($"/api/enrollments/{enrollment.Id}", new {
            enrollment.Id, enrollment.Reference, enrollment.ProfileId, enrollment.ExamId,
            enrollment.SessionId, enrollment.Centre, enrollment.Status, enrollment.CreatedAt
        });
    }
}
