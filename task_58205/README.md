# Enrollment dashboard sample · Task #58205

Open `index.html` directly in Chrome. No installation, server, network calls, credentials, or build is required. The preview uses a fixed fictional snapshot dated **15 October 2026 (IST)** aligned with the proposed PRD in `../Enrollment_Dashboard_PRD_58203.html`.

## Included

- Apply/reset enrollment period, exam, centre and status filters; totals, status counts, daily trend and exam shares reconcile.
- Accessible equivalent chart tables, enrollment drill-down, explicit empty states and unknown-exam grouping.
- Separate profile submission/review-status and session-date controls.
- Profile details, approve/reject/request correction, required reasons, confirmation, in-memory audit and record-version guard.
- Session detail views; active holds reduce availability; full, booking closed, overcapacity and missing availability examples.
- Responsive layout, labeled controls, native keyboard-accessible dialogs and visible focus.

## Validation

Run `node --check app.js`, `node --check data.js`, and `node verify.cjs` from this directory. The verification uses a minimal DOM stub to exercise actual application functions. It covers reconciled distinct enrollments, combined filters, empty results, independent section date scopes, seat calculation edges, mandatory review reasons, correction audit, duplicate decisions and record-version conflicts. Chrome rendering and accessibility text were inspected on the desktop. Browser interaction checks were interrupted by detected user input and were not resumed to avoid interfering with the user.

## Scope and limitations

This is a sample UI, not a connected production workflow. Review changes and audit events remain in memory and reset on reload; notifications are not sent. There is no server authorization, durable storage, real identity/document review, network loading/retry integration, multi-user concurrency, pagination, or performance certification. Date ranges are three representative enrollment presets rather than arbitrary dates; trend granularity is daily. The small fixed queue/session set does not need pagination. Production permissions, authoritative business statuses, async failure handling, backend audit and conflict checks, live data freshness and remaining PRD requirements require implementation and acceptance testing against real services. Export is not included because the PRD leaves it outside the confirmed scope.
