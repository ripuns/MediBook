# Routes

## Purpose
This folder contains the Express route definitions for the MediBook API. Each route maps a URL and HTTP method to the appropriate controller and applies middleware for authentication or role enforcement.

## Why this folder exists
Routes define the public contract of the backend. Separating them from controllers and services keeps API registration clean and makes it easier to manage auth, authorization, and endpoint versioning as the app grows.

## Current route modules
| File | What it does |
|------|--------------|
| `auth.routes.ts` | Exposes public auth endpoints for registration, login, refresh, logout, and current-user lookup. |
| `admin.routes.ts` | Protects admin endpoints behind `requireAuth` and `requireRole(['ADMIN'])`. |
| `patient.routes.ts` | Protects patient endpoints for appointment history and patient-specific booking actions. |
| `doctor.routes.ts` | Protects doctor endpoints for profile management, appointment history, and completion actions. |
| `booking.routes.ts` | Handles slot listing, hold, confirm, and cancel flows for patient booking activity. |
| `calendar.routes.ts` | Handles Google Calendar OAuth connect, callback, and connection-status endpoints. |

## Route responsibilities
- request entry points are registered in `src/app.ts`
- controllers handle request parsing and response shaping
- services perform the actual business logic and Prisma operations
- auth middleware enforces login and role requirements before controllers execute

## Typical flow
A request moves through the stack like this:
1. Express route receives the request
2. auth/role middleware checks access
3. controller validates the payload and calls the relevant service
4. service performs the domain logic and writes to Prisma
5. controller returns the final JSON response

This keeps the HTTP layer thin while preserving a clear and predictable API structure.
