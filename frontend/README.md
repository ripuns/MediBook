# MediBook Frontend

This folder contains the Next.js frontend for the MediBook healthcare appointment platform.

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Base UI React
- lucide-react

## Purpose
The frontend provides a polished, responsive dashboard-style interface for patient, doctor, and admin portals:
- **Authentication**: Modern, centralized forms for registration and sign-in with role-specific redirection.
- **Patient Workspace**: Discovery cards for clinicians, available slots grid picker, pre-visit symptom intake form, and active appointment schedules. Includes Google Calendar connection status management.
- **Clinician Workspace**: Today's scheduled visits queue, pre-visit AI diagnostics card, and a form to record post-consultation documentation and prescriptions.
- **Admin Workspace**: Central metrics overview (totals for patients, doctors, appointments, and live holds), doctor onboarding form, clinician profile editor with leave calendar logs, and registries for appointments and notification logs.

## Layout & Architecture
- `src/components/layout/LayoutShell.tsx` dynamically monitors the active route path, hiding the sidebar and navbar for public landing and authentication pages to present a clean full-screen experience, while rendering a flex-column dashboard panel for portal pages.

## Scripts
- `npm run dev` — starts the local development server (typically at http://localhost:3000)
- `npm run build` — validates production compilation and TypeScript definitions
- `npm run start` — serves the optimized production build
- `npm run lint` — runs ESLint checks

## Local development
From this folder, run:

```bash
npm install
npm run dev
```
