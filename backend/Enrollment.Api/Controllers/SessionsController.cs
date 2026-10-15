using Enrollment.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Enrollment.Api.Controllers;

[ApiController, Route("api/sessions")]
public sealed class SessionsController(EnrollmentDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken token)
    {
        var rows = await db.Sessions.AsNoTracking().OrderBy(x => x.StartsAt).Select(x => new {
            x.Id, x.ExamId, ExamName = x.Exam.Name, x.Centre, x.StartsAt, x.Capacity, x.HeldSeats,
            x.BookingOpen, BookedSeats = db.Enrollments.Count(e => e.SessionId == x.Id && e.Status == "Confirmed")
        }).ToListAsync(token);
        return Ok(rows.Select(x => new { x.Id, x.ExamId, x.ExamName, x.Centre, x.StartsAt, x.Capacity,
            x.HeldSeats, x.BookedSeats, BookingOpen = x.BookingOpen && x.StartsAt > DateTimeOffset.UtcNow,
            AvailableSeats = Math.Max(0, x.Capacity - x.HeldSeats - x.BookedSeats) }));
    }
}
