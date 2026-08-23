# MediBook Frontend

This folder contains the Next.js frontend for the MediBook healthcare appointment platform.

## Stack
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui

## Purpose
The frontend provides the patient, doctor, and admin interfaces required to:
- register and sign in
- browse doctors and available appointment slots
- hold, confirm, and cancel appointments
- review appointment details and summaries
- connect Google Calendar for scheduling workflows
- manage admin and doctor operations from the dashboard

## Scripts
- `npm run dev` — starts the local development server
- `npm run build` — validates the production build
- `npm run start` — serves the production build
- `npm run lint` — runs ESLint checks

## Local development
From this folder, run:

```bash
npm install
npm run dev
```

Then open the local URL printed in the terminal, typically http://localhost:3000.

## Notes
This app is scaffolded according to the master implementation plan and is the next step after the backend integration layer was completed and the reminder cron startup was fixed.
