# Prisma

## Purpose
This folder is responsible for the database layer of the MediBook backend. It stores the Prisma schema, the migration history, and the database configuration that maps the application models to PostgreSQL tables.

## Why a separate folder?
Keeping the database contract isolated from the rest of the backend enforces a clean boundary between application logic and persistence. This makes schema changes, migrations, and data concerns easier to review, test, and evolve without affecting business logic code.

## Files in this folder
| File | What it does |
|------|--------------|
| schema.prisma | Defines the PostgreSQL schema, enums, and Prisma models used across the platform |
| seed.ts | Creates default admin, doctor, and patient records for local development and testing |
| migrations/ | Stores generated migration files created when Prisma evolves the database schema |

## How it connects to the rest of the system
The backend application uses Prisma client access from the application source tree to read and write users, appointments, notifications, and OAuth tokens. The schema and seed data here define the initial data contract and development baseline that services, controllers, jobs, and tests rely on.
