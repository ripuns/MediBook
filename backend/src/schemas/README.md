# Schemas

## Purpose
This folder holds the request-validation contracts for the backend API. It defines the Zod schemas used to validate auth payloads before the application processes them.

## Why a separate folder?
Validation logic is shared across routes and controllers, and it benefits from being isolated from business rules. Keeping schemas together makes API contracts easier to review and reuse consistently.

## Files in this folder
| File | What it does |
|------|--------------|
| auth.schema.ts | Validates registration, login, refresh-token, logout, and me requests |

## How it connects to the rest of the system
The schemas are imported by controller or route layers before they call auth services. This ensures malformed payloads fail early with consistent 400-level validation responses.
