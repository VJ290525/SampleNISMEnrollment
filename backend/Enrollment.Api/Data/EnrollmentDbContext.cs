using Enrollment.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Enrollment.Api.Data;

public sealed class EnrollmentDbContext(DbContextOptions<EnrollmentDbContext> options) : DbContext(options)
{
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<CandidateProfile> Profiles => Set<CandidateProfile>();
    public DbSet<ExamSession> Sessions => Set<ExamSession>();
    public DbSet<CandidateEnrollment> Enrollments => Set<CandidateEnrollment>();
    public DbSet<ProfileReview> Reviews => Set<ProfileReview>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Exam>(e => {
            e.Property(x => x.Code).HasMaxLength(30); e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Name).HasMaxLength(150); e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.Description).HasMaxLength(1000);
        });
        model.Entity<CandidateProfile>(e => {
            e.Property(x => x.Reference).HasMaxLength(40); e.HasIndex(x => x.Reference).IsUnique();
            e.Property(x => x.FullName).HasMaxLength(120);
            e.Property(x => x.Email).HasMaxLength(254); e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Phone).HasMaxLength(20); e.Property(x => x.Centre).HasMaxLength(100);
            e.Property(x => x.Status).HasMaxLength(30); e.Property(x => x.ReviewReason).HasMaxLength(1000);
            e.Property(x => x.Version).IsRowVersion();
        });
        model.Entity<ExamSession>(e => {
            e.Property(x => x.Centre).HasMaxLength(100);
            e.HasOne(x => x.Exam).WithMany().HasForeignKey(x => x.ExamId).OnDelete(DeleteBehavior.Restrict);
            e.ToTable(t => t.HasCheckConstraint("CK_Session_Seats", "[Capacity] >= 0 AND [HeldSeats] >= 0 AND [HeldSeats] <= [Capacity]"));
        });
        model.Entity<CandidateEnrollment>(e => {
            e.Property(x => x.Reference).HasMaxLength(40); e.HasIndex(x => x.Reference).IsUnique();
            e.HasIndex(x => new { x.ProfileId, x.ExamId }).IsUnique();
            e.HasIndex(x => x.SessionId); e.HasIndex(x => x.CreatedAt);
            e.Property(x => x.Centre).HasMaxLength(100); e.Property(x => x.Status).HasMaxLength(30);
            e.HasOne(x => x.Profile).WithMany().HasForeignKey(x => x.ProfileId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Exam).WithMany().HasForeignKey(x => x.ExamId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Session).WithMany().HasForeignKey(x => x.SessionId).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<ProfileReview>(e => {
            e.Property(x => x.PreviousStatus).HasMaxLength(30); e.Property(x => x.NewStatus).HasMaxLength(30);
            e.Property(x => x.Reason).HasMaxLength(1000);
            e.HasOne(x => x.Profile).WithMany().HasForeignKey(x => x.ProfileId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
