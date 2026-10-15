# SampleNISMEnrollment

Enrollment management application for NISM with a React frontend, ASP.NET Core API, and SQL Server database.

Add exam names, candidate profiles, and enrollments; approve or reject pending profiles; view enrollment trends, exam distribution, and session seat availability. Records are persisted in SQL Server and dashboard data refreshes after successful changes.

The original static prototype and planning documents are retained in their existing folders. The new application uses real database persistence and starts with three demonstration exams and future sessions, without fictional candidate records.

## Run the application

Requirements: .NET SDK 8 or later with the .NET 8 runtime, Node.js 22.12+ (Node.js 24 is supported), and SQL Server or SQL Server LocalDB. The default connection uses Windows authentication with `(localdb)\MSSQLLocalDB` and database `NismEnrollment`.

From the repository root, run:

```powershell
.\scripts\Start-App.ps1
```

This installs frontend dependencies, builds both projects, copies the React production build to the API's static files directory, applies database migrations, and starts the application at **http://localhost:5080**. Keep the terminal running; Ctrl+C stops it. After a successful build, use `-SkipBuild` for a faster restart.

To select another SQL Server, set `ConnectionStrings__EnrollmentDatabase` in your environment before starting. Use .NET user secrets or the ignored `appsettings.Local.json` for private configuration. See [database setup](database/README.md) and the [idempotent schema script](database/schema.sql).

### Use the new features

1. Select **Add exam name** to create a unique code and examination name.
2. Select **Add profile** to save a candidate's name, email, phone number, and preferred centre. New profiles are Pending.
3. Open **Profiles**, select **Review**, and confirm approval.
4. Select **Add enrollment**, choose the approved candidate and exam, and optionally select a session. With no session, the enrollment is saved as unassigned to a session. New exams can be used immediately without creating a session.
5. Check **Enrollments** or refresh the page to verify that records persist.

Duplicate exam codes/names, profile emails, and candidate/exam enrollments are rejected. Session seats are checked in a serializable transaction. Review decisions use SQL Server rowversion to detect stale updates and save an audit record.

### Development servers

Run the API and Vite in separate terminals:

```powershell
$env:Database__Initialize = 'true'
dotnet run --project backend/Enrollment.Api
```

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to port 5080. The API also serves the built frontend on port 5080 when `wwwroot` has been prepared by the start script.

### API routes

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/exams` | GET, POST | List or create exam names |
| `/api/profiles` | GET, POST | List or create candidate profiles |
| `/api/profiles/{id}/review` | POST | Review a pending profile with its current version |
| `/api/enrollments` | GET, POST | List or create enrollments |
| `/api/sessions` | GET | Session details and current availability |
| `/api/health` | GET | Process health, independent of database readiness |

This is a local development application without sign-in or role enforcement. Keep it on localhost. Production authentication, authorization, HTTPS deployment, pagination, session administration, profile resubmission after rejection/correction, and cancellation/re-enrollment rules remain outside this implementation. Review audit records capture the transition and reason; no authenticated reviewer identity is claimed. The proposed rule is one enrollment per candidate and exam; profile approval is required first.

## Validate the application

Frontend type checking, production build, and behavior tests:

```powershell
cd frontend
npm ci
npm run build
npm test
```

SQL Server API integration tests (from the repository root):

```powershell
dotnet test backend/Enrollment.Api.Tests
```

The tests create and remove an isolated LocalDB database; they do not use the application database. They cover persistence, normalized duplicates, validation, approval gating, stale review versions, and concurrent last-seat booking.

The earlier static prototype can still be opened directly at [task_58205/index.html](task_58205/index.html). Its [README](task_58205/README.md) describes that prototype's separate sample-data limitations.

## Project documents

- [Product requirements](Enrollment_Dashboard_PRD_58203.html)
- [Test specification](task_58204/docs/enrollment-dashboard-tests.html)
- [Structured test cases](task_58204/test_cases.json)
- [Session summary and time comparison](Session%20chats.md)
