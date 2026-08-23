# Services

## Purpose
This folder contains the core backend business logic for MediBook. It is where domain operations such as authentication, booking, and notifications are implemented independently from HTTP route code.

## Why a separate folder?
Business logic is the most reusable and testable part of the backend. Keeping it in services creates a clean separation between controller concerns (requests/responses) and domain behavior (rules, validation, and data mutations).

## Files in this folder
| File | What it does |
|------|--------------|
| auth.service.ts | Handles registration, login, refresh token rotation, logout, and authenticated user lookup |
| booking.service.ts | Generates available doctor slots from working hours, filters out held or confirmed times, and manages hold/confirm/cancel flows with transaction-safe double-booking protection |
| leave.service.ts | Creates, lists, and cancels doctor leave dates while preventing duplicate leave entries and enforcing doctor ownership |
| llm.service.ts | Runs pre-visit and post-visit AI summaries via OpenAI and falls back to safe JSON objects whenever the model is unavailable |
| notification.service.ts | Queues email and system notifications, sends the pending work through a retry-safe pipeline, and records delivery state in the database |

## How it connects to the rest of the system
Controllers call into the service layer to perform secure auth actions and slot availability checks, while the service layer reads from Prisma and JWT utilities. This keeps HTTP handlers thin and keeps business rules centralised. The notification service connects the booking and reminder flows to email delivery and the background retry job.
