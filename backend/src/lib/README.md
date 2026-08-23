# Lib

## Purpose
This folder contains reusable backend utilities shared across services, controllers, and jobs. It centralises database access, auth helpers, and integration logic so route handlers and business code stay focused.

## Why a separate folder?
Libraries are cross-cutting concerns that are used in many parts of the backend. Keeping them in one place makes the codebase easier to maintain, test, and extend without duplicating common setup or token handling logic.

## Files in this folder
| File | What it does |
|------|--------------|
| prisma.ts | Exposes the shared Prisma client instance used across the backend |
| jwt.ts | Signs and verifies access and refresh tokens for authentication flows |
| calendar.ts | Builds the Google OAuth client, stores calendar tokens, and creates/updates/deletes Google Calendar events |

## How it connects to the rest of the system
The Prisma singleton, JWT helpers, and calendar utility are imported by services and controllers whenever they need database access, auth tokens, or Google Calendar actions. This keeps infrastructure concerns consistent and reduces duplication across the app.
