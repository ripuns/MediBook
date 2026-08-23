# Controllers

## Purpose
This folder contains the HTTP-facing controller layer for MediBook. Each controller accepts an Express request, validates the request context, calls the correct service or helper, and returns a normalized JSON response.

## Role in the app
Controllers sit between the route layer and the service layer:
- they handle auth/role checks,
- parse request bodies and params,
- invoke domain logic in services,
- and convert results into consistent API responses.

This keeps DB access, scheduling rules, notification logic, and business workflows out of the route layer.

## Files in this folder
| File | What it does |
|------|--------------|
| auth.controller.ts | Handles register, login, refresh, logout, and current-user endpoints with input validation and standardized error handling. |
| admin.controller.ts | Returns admin overview metrics such as totals for users, doctors, and active held slots. |
| patient.controller.ts | Returns patient appointments and contains the booking-confirmation orchestration that triggers AI summary generation, email queueing, and Google Calendar event creation. |
| doctor.controller.ts | Exposes doctor profile reads/updates, doctor appointment retrieval, and appointment completion orchestration that generates post-visit summaries and cleans up calendar events. |
| booking.controller.ts | Handles slot listing, hold, confirm, and cancel flows for patients and doctors, including the confirm flow that uses patient-side integrations. |
| calendar.controller.ts | Starts the Google OAuth connection flow, handles the callback, and checks whether a user has already connected Google Calendar. |

## Controller responsibilities by feature
### Authentication
`auth.controller.ts` is responsible for user lifecycle endpoints:
- register
- login
- refresh token
- logout
- get current user

### Administrative and patient flows
- `admin.controller.ts` provides admin metrics.
- `patient.controller.ts` exposes appointment history and the confirmation workflow for booked visits.

### Doctor flows
`doctor.controller.ts` handles:
- viewing the doctor profile,
- updating doctor profile details,
- listing doctor appointments,
- completing a visit and producing a summary.

### Booking and scheduling
`booking.controller.ts` is the booking entry point for:
- listing available slots for a doctor,
- holding a slot,
- confirming a held slot,
- cancelling a held or confirmed appointment.

### Google Calendar integration
`calendar.controller.ts` manages:
- Google OAuth URL generation,
- token exchange and persistence,
- user connection status checks.

## Notes
The controller layer is intentionally thin. It validates request payloads and orchestrates calls to the service layer; the scheduling logic, notifications, LLM summarization, and Google Calendar work live in service or library files rather than inside controller code.
