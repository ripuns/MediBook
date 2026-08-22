# Lib

## Purpose
This folder contains reusable backend utilities that are shared across services, controllers, and jobs. It centralises database access, shared data helpers, and common application logic that should not live in individual route handlers.

## Why a separate folder?
Libraries are cross-cutting concerns with broad reuse across the backend. Keeping them in a dedicated folder gives the application a clear place for shared infrastructure logic and prevents controllers and services from re-implementing the same boilerplate.

## Files in this folder
| File | What it does |
|------|--------------|
| prisma.ts | Exposes the single Prisma client instance used throughout the backend |
| jwt.ts | Signs and verifies access/refresh JWTs for authentication and session renewal |

## How it connects to the rest of the system
The Prisma singleton and JWT helpers are imported by services, controllers, and middleware whenever they need database access or authentication tokens. This keeps data access and auth flows consistent, testable, and decoupled from route logic.
