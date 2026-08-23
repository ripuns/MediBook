# Services

## Purpose
This folder contains the business logic layer for MediBook. Service modules handle the rules, Prisma operations, workflow steps, and external integrations used by the application.

## Why this folder exists
The service layer separates domain logic from transport concerns:
- controllers parse requests and shape responses
- services enforce business rules and coordinate database writes
- jobs trigger scheduled background work using these services
- routes expose the public HTTP API surface

## Current service modules
| File | What it does |
|------|--------------|
| `admin.service.ts` | Admin queries and dashboard-style summaries such as user totals and active holds. |
| `auth.service.ts` | Registration, login, token refresh, logout, and loading the authenticated user identity. |
| `booking.service.ts` | Slot generation, hold creation, booking confirmation, cancellation, and double-booking protection. |
| `doctor.service.ts` | Doctor profile reads/updates and appointment queries for doctor flows. |
| `leave.service.ts` | Leave-day creation and related appointment cancellation logic for doctor scheduling. |
| `patient.service.ts` | Patient appointment history and patient-specific booking queries. |
| `llm.service.ts` | OpenAI-based patient/doctor summary generation with graceful fallback behavior when the key is missing or the API fails. |
| `email.service.ts` | SMTP delivery for transactional email messages. |
| `notification.service.ts` | Notification queueing, status tracking, retry handling, and dispatch orchestration. |

## Architectural responsibilities
The service layer is responsible for:
- enforcing scheduling and access rules
- reading/writing Prisma models in a consistent way
- guarding ownership checks and domain invariants
- handling external integrations without leaking raw transport concerns into controllers
- keeping business logic testable and reusable

## External integrations
The service layer intentionally separates concerns:
- `llm.service.ts` handles AI summarization and fallback payload generation
- `email.service.ts` handles actual email sending
- `notification.service.ts` manages queue state and retry behavior

This keeps the app resilient when an external provider is unavailable or misconfigured.

## Interaction with the rest of the app
Controllers call services for domain actions, while services read Prisma data, update appointment state, and trigger notification or calendar workflows. This keeps HTTP handlers thin and keeps important business behavior centralized.
