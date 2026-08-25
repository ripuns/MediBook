# Patient Portal

This module contains the patient-facing workspace and scheduling flow for MediBook.

## Pages
- `dashboard/page.tsx` — overview metrics (upcoming visits, available doctors, care reminders), quick access to search clinicians, and a Google Calendar synchronisation controller.
- `doctors/page.tsx` — searchable clinician directory displaying bio highlights and specialization tags.
- `book/[doctorId]/page.tsx` — two-column booking panel allowing date and slot picker selection alongside symptom and notes intake fields.
- `appointments/page.tsx` — registry display of all patient's scheduled consultation records, displaying status badges and cancellation actions.

## Components
- `components/booking/SlotPicker.tsx` — slot selection grid matching the calendar availability check.
- `components/booking/SymptomForm.tsx` — pre-visit symptom intake textareas.
