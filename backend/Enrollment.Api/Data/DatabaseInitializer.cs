using Enrollment.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Enrollment.Api.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(EnrollmentDbContext db, CancellationToken token)
    {
        await db.Database.MigrateAsync(token);
        if (await db.Exams.AnyAsync(token)) return;
        var exams = new[] {
            new Exam { Code = "V-A", Name = "Mutual Fund Distributors", Description = "Demonstration examination" },
            new Exam { Code = "VIII", Name = "Equity Derivatives", Description = "Demonstration examination" },
            new Exam { Code = "XV", Name = "Research Analyst", Description = "Demonstration examination" }
        };
        db.Exams.AddRange(exams);
        await db.SaveChangesAsync(token);
        var today = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(5.5)).Date;
        db.Sessions.AddRange(exams.Select((exam, i) => new ExamSession {
            ExamId = exam.Id, Centre = i == 1 ? "Pune" : "Mumbai",
            StartsAt = new DateTimeOffset(today.AddDays(i + 7).AddHours(10), TimeSpan.FromHours(5.5)),
            Capacity = 50, HeldSeats = 0
        }));
        await db.SaveChangesAsync(token);
    }
}
