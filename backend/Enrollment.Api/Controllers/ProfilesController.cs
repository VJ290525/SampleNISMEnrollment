using Enrollment.Api.Contracts;
using Enrollment.Api.Data;
using Enrollment.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Enrollment.Api.Controllers;

[ApiController, Route("api/profiles")]
public sealed class ProfilesController(EnrollmentDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken token) => Ok(await db.Profiles.AsNoTracking()
        .OrderByDescending(x => x.CreatedAt).ToListAsync(token));

    [HttpPost]
    public async Task<IActionResult> Create(CreateProfileRequest input, CancellationToken token)
    {
        var email = input.Email.Trim().ToLowerInvariant();
        if (await db.Profiles.AnyAsync(x => x.Email == email, token))
            return Problem(statusCode: 409, title: "A profile with this email already exists.");
        var profile = new CandidateProfile {
            FullName = input.FullName.Trim(), Email = email, Phone = input.Phone.Trim(), Centre = input.Centre.Trim()
        };
        db.Profiles.Add(profile);
        await db.SaveChangesAsync(token);
        return Created($"/api/profiles/{profile.Id}", profile);
    }

    [HttpPost("{id:int}/review")]
    public async Task<IActionResult> Review(int id, ReviewProfileRequest input, CancellationToken token)
    {
        if (input.Status != "Approved" && string.IsNullOrWhiteSpace(input.Reason))
            return Problem(statusCode: 400, title: "A reason is required for rejection or correction.");
        var profile = await db.Profiles.FindAsync([id], token);
        if (profile is null) return NotFound();
        if (profile.Status != "Pending" || Convert.ToBase64String(profile.Version) != input.Version)
            return Problem(statusCode: 409, title: "This profile changed. Refresh before reviewing it.");
        db.Reviews.Add(new ProfileReview {
            ProfileId = id, PreviousStatus = profile.Status, NewStatus = input.Status, Reason = input.Reason?.Trim() ?? ""
        });
        profile.Status = input.Status;
        profile.ReviewReason = input.Reason?.Trim() ?? "";
        await db.SaveChangesAsync(token);
        return Ok(profile);
    }
}
