# Services

## Purpose
This folder contains the backend's core business logic for MediBook. It keeps domain rules, database operations, and external integration logic separate from HTTP controllers and routing code.

## Why this folder exists
Business logic is the most reusable and testable part of the application. Keeping service code in one layer creates a clean separation between:
- controllers: request validation, parsing, response shaping
- services: business rules, Prisma access, transaction handling
- jobs: scheduled background tasks that invoke service logic
- routes: API surface exposure

## Current service modules
| File | What it does |
|------|--------------|
| admin.service.ts | Admin-specific operations such as managing users, doctor records, and system-level administrative queries |
| auth.service.ts | Handles registration, login, token refresh, logout, and authenticated user lookups |
| booking.service.ts | Generates available slots, filters blackout periods, manages hold/confirm/cancel transitions, and protects against double booking |
| doctor.service.ts | Doctor-facing logic for profile access, appointment queries, and doctor-specific domain operations |
| leave.service.ts | Creates, lists, and cancels leave periods while preventing duplicate or conflicting leave entries |
| patient.service.ts | Patient-specific appointment and profile operations, including booking history and patient access checks |
| llm.service.ts | Calls OpenAI for pre-visit/post-visit summarisation and returns safe fallback payloads when the API key is missing or the model fails |
| email.service.ts | Provides SMTP-based transactional email sending and centralises email payload formatting |
| notification.service.ts | Queues notifications, tracks status and attempts, and delegates final delivery to the email service |

## Architectural responsibilities
The service layer is responsible for:
- enforcing business rules
- coordinating Prisma transactions
- validating ownership and access boundaries
- handling external integrations without leaking raw HTTP concerns into controllers
- exposing deterministic logic that is easy to unit test

## External integrations
The service layer intentionally keeps integrations decoupled:
- llm.service.ts handles AI summarisation and graceful fallback behavior
- email.service.ts handles SMTP delivery
- notification.service.ts manages queueing, retry logic, and notification status tracking

This separation keeps the overall system resilient when an external provider is unavailable or misconfigured.

## Interaction with the rest of the app
Controllers call into services for domain actions, and services read/write Prisma models and shared utilities. This keeps request handlers thin while centralising critical business behavior in one place.
