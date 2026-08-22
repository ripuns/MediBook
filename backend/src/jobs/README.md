# Jobs

## Purpose
This folder contains background tasks that run independently from the request lifecycle. These jobs keep the system state consistent even when no user is actively interacting with the API.

## Files in this folder
- `expiredHoldCleanup.ts` - runs a cron job every minute to cancel appointments that are still marked `HELD` after their `holdExpiresAt` timestamp has passed.

## Why it matters
Held booking slots are temporary reservations. If they are not released automatically, expired holds can block real availability and create noisy double-booking edge cases.

## Runtime behavior
- scheduled via `node-cron`
- checks only `HELD` appointments with `holdExpiresAt < now`
- converts expired holds into `CANCELLED` state and clears the expiry timestamp
