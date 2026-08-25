# Admin Portal

This module contains the administrative dashboard, clinician onboarding, and log monitoring screens for MediBook.

## Pages
- `dashboard/page.tsx` — overview metrics (Total Patients, Active Doctors, Appointments, Pending Holds), system load indicators, and operational reminders.
- `doctors/page.tsx` — registry table listing clinicians with quick actions to view or update profiles.
- `doctors/new/page.tsx` — onboarding form to create user credentials and profile records.
- `doctors/[id]/page.tsx` — editor for clinician specialisation, bio, slots duration, leave calendar logs, and danger zone actions.
- `appointments/page.tsx` — system-wide registry table log for scheduling tracking.
- `notifications/page.tsx` – logbook listing notification dispatches, channels, attempts, and error diagnoses.

## Notes
All administrative views are fully wired to active backend API endpoints (`/api/admin/*`) and display live database records.
