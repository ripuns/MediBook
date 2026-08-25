# Doctor Portal

This module contains the clinician-facing workflow for reviewing schedules, reading pre-visit symptom summaries, and documenting patient charts.

## Pages
- `dashboard/page.tsx` — provider workspace dashboard displaying active queues, schedule counts, and Google Calendar sync buttons.
- `appointments/page.tsx` — comprehensive list table showing patient history records and consultation dates.
- `appointments/[id]/page.tsx` — dual-column patient medical chart view, rendering contact logs, intake symptoms, AI pre-visit insights, and documentation input fields for clinical findings and prescriptions.

## Components
- `components/appointments/PreVisitSummaryBadge.tsx` — smart gradient card displaying AI pre-visit assessment summaries.
