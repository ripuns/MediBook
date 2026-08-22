# Middleware

## Purpose
This folder centralises request-level behavior for the backend API. It handles authentication checks and standardises how application errors are returned to clients.

## Why a separate folder?
Middleware sits between the HTTP layer and business logic, and it is shared across many routes. Keeping it in a dedicated folder makes permission checks and error responses consistent instead of scattered across controllers.

## Files in this folder
| File | What it does |
|------|--------------|
| auth.ts | Validates bearer tokens and enforces role-based access control |
| errorHandler.ts | Formats thrown errors into consistent JSON responses |

## How it connects to the rest of the system
The auth middleware is attached to protected routes in the API layer, and the error handler is mounted globally to ensure all thrown errors are returned with predictable HTTP structure.
