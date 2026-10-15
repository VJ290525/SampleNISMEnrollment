namespace Enrollment.Api.Models;

public sealed class Exam
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class CandidateProfile
{
    public int Id { get; set; }
    public string Reference { get; set; } = $"C-{Guid.NewGuid():N}";
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Centre { get; set; } = "";
    public string Status { get; set; } = "Pending";
    public string ReviewReason { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public byte[] Version { get; set; } = [];
}

public sealed class ExamSession
{
    public int Id { get; set; }
    public int ExamId { get; set; }
    public Exam Exam { get; set; } = null!;
    public string Centre { get; set; } = "";
    public DateTimeOffset StartsAt { get; set; }
    public int Capacity { get; set; }
    public int HeldSeats { get; set; }
    public bool BookingOpen { get; set; } = true;
}

public sealed class CandidateEnrollment
{
    public int Id { get; set; }
    public string Reference { get; set; } = $"E-{Guid.NewGuid():N}";
    public int ProfileId { get; set; }
    public CandidateProfile Profile { get; set; } = null!;
    public int ExamId { get; set; }
    public Exam Exam { get; set; } = null!;
    public int? SessionId { get; set; }
    public ExamSession? Session { get; set; }
    public string Centre { get; set; } = "";
    public string Status { get; set; } = "Confirmed";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class ProfileReview
{
    public long Id { get; set; }
    public int ProfileId { get; set; }
    public CandidateProfile Profile { get; set; } = null!;
    public string PreviousStatus { get; set; } = "";
    public string NewStatus { get; set; } = "";
    public string Reason { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
