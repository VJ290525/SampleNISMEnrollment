# SampleNISMEnrollment

Sample Enrollment Dashboard project for NISM.

The project work covers enrollment trends, exam distribution, profile review controls, and upcoming sessions with seat availability. Deliverables include a proposed product requirements document, a test case specification, and an interactive dashboard prototype.

The prototype uses fictional demonstration data. Production integration and approval of the proposed business rules are separate work.

## Run the application

Clone this repository and open [task_58205/index.html](task_58205/index.html) in Chrome. No installation, build step, server, or network connection is required. Profile review changes stay in memory and reset when the page reloads.

See the [dashboard README](task_58205/README.md) for features and implementation limits.

## Validate the application

With Node.js installed, run:

```powershell
cd task_58205
node --check app.js
node --check data.js
node verify.cjs
```

## Project documents

- [Product requirements](Enrollment_Dashboard_PRD_58203.html)
- [Test specification](task_58204/docs/enrollment-dashboard-tests.html)
- [Structured test cases](task_58204/test_cases.json)
- [Session summary and time comparison](Session%20chats.md)
