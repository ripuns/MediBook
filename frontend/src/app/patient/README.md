# Patient Portal

This module contains the patient-facing booking flow for MediBook.

## Pages
- `dashboard/page.tsx` — summary of upcoming appointments, doctor search, and quick actions.
- `doctors/page.tsx` — searchable doctor directory for a patient.
- `book/[doctorId]/page.tsx` — slot selection and symptom intake for a chosen doctor.

## Components
- `components/booking/SlotPicker.tsx` — date and time slot selection UI.
- `components/booking/SymptomForm.tsx` — symptom intake form for appointment booking.
