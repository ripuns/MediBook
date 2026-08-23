# Jobs

## Purpose
This folder contains scheduled background jobs for Medibook. The jobs run independently of the request lifecycle and clean up expired bookings, enqueue reminders, and retry queued notification delivery.

## Why this folder exists
The app needs background maintenance that cannot safely block normal API requests. These jobs keep the scheduling system consistent and reduce user-facing latency by moving non-critical work out of the request path.

## Current job modules
| File | What it does |
|------|--------------|
| `expiredHoldCleanup.ts` | Runs a cron task every minute to release expired held slots by changing stale `HELD` appointments to `CANCELLED`. |
| `notificationRetry.ts` | Processes queued notifications and retries failed or pending sends with bounded retry logic. |
| `notificationRetry.job.ts` | Entry-point wrapper that schedules the notification retry loop via `node-cron`. |
| `appointmentReminder.job.ts` | Scans for confirmed appointments due within the reminder window and queues appointment reminder emails. |
| `medicationReminder.job.ts` | Scans for due medication reminders and queues patient email notifications when they are due. |

## Runtime behavior
- scheduled with `node-cron`
- `expiredHoldCleanup` prevents stale holds from blocking real availability
- `notificationRetry` ensures queued notifications are eventually sent or marked failed
- reminder jobs proactively notify patients before a scheduled appointment or medication event

## Startup integration
The jobs are started from the backend bootstrap in `src/server.ts`, so they begin running as soon as the server starts.
