# Controllers

## Purpose
This folder contains HTTP controllers that translate incoming API requests into service calls and response payloads. It is the boundary between the Express app and backend business logic.

## Why a separate folder?
Controllers isolate request parsing and response mapping from domain logic. This keeps route files cleaner and makes the app easier to extend without mixing transport concerns into services.

## Files in this folder
| File | What it does |
|------|--------------|
| auth.controller.ts | Handles auth endpoints and returns structured JSON metadata for login, registration, refresh, logout, and me |
| admin.controller.ts | Exposes admin-only summary metrics such as user totals, doctor totals, and active held slots |
| patient.controller.ts | Returns a patient’s appointments with nested doctor information |
| doctor.controller.ts | Exposes doctor profile, updates, and appointment history |

## How it connects to the rest of the system
The controller layer receives Express requests, checks authentication and role requirements, calls the service layer, and sends the final JSON response back to the client. This keeps the app modular while preserving a single, predictable API contract.
