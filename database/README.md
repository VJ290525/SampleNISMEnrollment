# SQL Server database

The ASP.NET Core application uses Entity Framework Core with the SQL Server provider. The checked-in migration and [schema.sql](schema.sql) describe the same schema.

Tables: `Exams`, `Profiles`, `Sessions`, `Enrollments`, and `Reviews`. Foreign keys prevent orphan enrollments. Unique indexes enforce exam codes, exam names, profile emails, references, and one enrollment per candidate and exam. SQL Server rowversion protects profile decisions. Booking uses a serializable transaction to prevent overselling.

For local development, the default connection uses Windows authentication and SQL Server LocalDB:

```text
Server=(localdb)\MSSQLLocalDB;Database=NismEnrollment;Trusted_Connection=True;TrustServerCertificate=True
```

To use another SQL Server instance, set `ConnectionStrings__EnrollmentDatabase` in your process environment or use .NET user secrets. Do not commit passwords. The application reads optional ignored `appsettings.Local.json` as well.

The start script opts into `Database__Initialize=true`, which applies the migration and adds three demonstration exams with future sessions if the exam table is empty. It does not create candidate profiles or enrollments. Migration uses the configured connection only. For a managed database, apply the idempotent SQL script through your normal database deployment process and leave automatic initialization disabled.

## Integration tests

API tests require LocalDB and create an isolated database named `NismEnrollmentTests_<random GUID>`. Only that test database is deleted on test teardown. The application database is not used by these tests.

```powershell
dotnet test backend/Enrollment.Api.Tests
```
