using System.ComponentModel.DataAnnotations;

namespace Enrollment.Api.Contracts;

public sealed record CreateExamRequest(
    [Required, StringLength(30), RegularExpression(@"[A-Za-z0-9][A-Za-z0-9 ._-]*")] string Code,
    [Required, StringLength(150)] string Name,
    [StringLength(1000)] string Description = "");

public sealed record CreateProfileRequest(
    [Required, StringLength(120)] string FullName,
    [Required, EmailAddress, StringLength(254)] string Email,
    [Required, RegularExpression(@"\+?[0-9 ()-]{7,20}")] string Phone,
    [Required, StringLength(100)] string Centre);

public sealed record CreateEnrollmentRequest(
    [Range(1, int.MaxValue)] int ProfileId,
    [Range(1, int.MaxValue)] int ExamId,
    [Required, StringLength(100)] string Centre,
    [Range(1, int.MaxValue)] int? SessionId = null);

public sealed record ReviewProfileRequest(
    [Required, RegularExpression("^(Approved|Rejected|Correction requested)$")] string Status,
    [Required, StringLength(100)] string Version,
    [StringLength(1000)] string Reason = "");
