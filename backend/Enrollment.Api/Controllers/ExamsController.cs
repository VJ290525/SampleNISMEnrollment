using Enrollment.Api.Contracts;
using Enrollment.Api.Data;
using Enrollment.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Enrollment.Api.Controllers;

[ApiController, Route("api/exams")]
public sealed class ExamsController(EnrollmentDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken token) => Ok(await db.Exams.AsNoTracking()
        .OrderBy(x => x.Code).ToListAsync(token));

    [HttpPost]
    public async Task<IActionResult> Create(CreateExamRequest input, CancellationToken token)
    {
        var code = input.Code.Trim().ToUpperInvariant();
        var name = input.Name.Trim();
        if (await db.Exams.AnyAsync(x => x.Code == code || x.Name == name, token))
            return Problem(statusCode: 409, title: "An exam with this code or name already exists.");
        var exam = new Exam { Code = code, Name = name, Description = input.Description?.Trim() ?? "" };
        db.Exams.Add(exam);
        await db.SaveChangesAsync(token);
        return Created($"/api/exams/{exam.Id}", exam);
    }
}
