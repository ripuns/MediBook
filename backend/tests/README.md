# Tests

## Purpose
This folder contains the backend test suite for MediBook. It validates the main API flows, especially authentication, booking, and fallback logic, before changes are merged.

## Why a separate folder?
Tests define expected behavior independently from production code. Keeping them in a dedicated folder makes regression detection straightforward and keeps the app's contract clear for developers and reviewers.

## Files in this folder
| File | What it does |
|------|--------------|
| auth.test.ts | Covers the authentication flows for registration, login, refresh, logout, and protected-user access |

## How it connects to the rest of the system
The tests exercise the Express app and the auth endpoints directly using Supertest. They confirm that the controller, service, Prisma, and JWT layers behave correctly as a single system.
