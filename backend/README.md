# backend

## Purpose
This folder contains the MediBook backend service: an Express + TypeScript API, database access via Prisma, background jobs, and integrations (email, LLM, Google Calendar). It holds server code, configuration, and tests for the backend.

## Why a separate folder?
Separating backend from frontend enforces a clear separation of concerns: API and server-side business logic live here, independently versioned and deployable. It keeps build, dependencies, and environment isolated from the frontend.

## Files in this folder
| File | What it does |
|------|--------------|
| package.json | Node scripts and dependency declarations for the backend service |
| tsconfig.json | TypeScript compiler options for the backend |
| jest.config.ts | Jest configuration for running backend tests |
| .env.example | Example environment variables required to run the backend |
| .gitignore | Files to ignore for backend development |
| src/ | Application source code (controllers, services, lib, routes) |
| tests/ | Jest + Supertest integration/unit tests |

## How it connects to the rest of the system
The backend exposes a JSON HTTP API consumed by the frontend (NEXT_PUBLIC_API_URL). The frontend depends on the backend's auth, booking, and calendar endpoints. Prisma connects this service to the PostgreSQL DATABASE_URL. Background jobs run in this process to manage holds, reminders, and notification retries.
