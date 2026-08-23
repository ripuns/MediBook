# Doctor Portal

This module contains the doctor-facing workflow for reviewing appointments, reading pre-visit summaries, and documenting post-visit notes.

## Pages
- `dashboard/page.tsx` — summary of today's schedule and patient queue.
- `appointments/[id]/page.tsx` — appointment detail page for a selected patient, including pre-visit summary and post-visit form.

## Components
- `components/appointments/PreVisitSummaryBadge.tsx` — displays a compact summary badge for AI-generated pre-visit context.
