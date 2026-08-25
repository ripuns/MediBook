# MediBook

MediBook is a healthcare appointment and follow-up manager with three portals: Patient, Doctor, and Admin. The app handles doctor discovery, slot holds, appointment confirmation, visit summaries, calendar connectivity, leave handling, and notification workflows.

## Tech Stack

- **Backend**: Node.js 20, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod, Nodemailer, Google Calendar API, node-cron
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Axios, React Context, Base UI React, lucide-react

## Project Structure

- `backend/` contains the API, database models, services, jobs, and tests.
- `frontend/` contains the Next.js app for all user portals.

## Local Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
```

Create `frontend/.env.local` with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Prepare the database:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

4. Start both apps:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Environment Variables

Backend uses:

```bash
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PORT=5000
NODE_ENV=development
GMAIL_USER=
GMAIL_APP_PASSWORD=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Frontend uses:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Overview

### Auth (`/api/auth`)

- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login and fetch JWT access/refresh tokens
- `POST /api/auth/refresh` — Refresh access token using refresh token
- `POST /api/auth/logout` — Invalidate user session
- `GET /api/auth/me` — Retrieve the current authenticated user identity

### Admin (`/api/admin`)

- `GET /api/admin/overview` — Get system health overview stats (patientCount, doctorCount, appointmentCount, pendingHoldCount)
- `GET /api/admin/appointments` — List all appointment logs in the system
- `GET /api/admin/notifications` — List system notification logs
- `GET /api/admin/doctors` — List registered clinicians
- `GET /api/admin/doctors/:id` — Retrieve a single doctor profile and leave list
- `POST /api/admin/doctors` — Create a new doctor user and profile
- `PUT /api/admin/doctors/:id` — Update doctor profile details
- `DELETE /api/admin/doctors/:id` — Delete a doctor profile (keeps the User entity)
- `POST /api/admin/doctors/:id/leave` — Record a leave day for a doctor
- `DELETE /api/admin/doctors/:id/leave/:leaveId` — Delete a leave day

### Patient (`/api/patient`)

- `GET /api/patient/appointments` — Fetch patient's upcoming and historical appointments
- `GET /api/patient/doctors` — Search and list doctors
- `GET /api/patient/doctors/:doctorId` — View detailed profile of a doctor
- `GET /api/patient/doctors/:doctorId/slots` — List available time slots for a doctor on a specific date
- `POST /api/patient/appointments/hold` — Place a temporary reservation hold on an appointment slot
- `PUT /api/patient/appointments/:appointmentId/confirm` — Confirm held appointment, providing symptom intake details and generating AI pre-visit summary
- `PUT /api/patient/appointments/:appointmentId/cancel` — Cancel a confirmed or held appointment

### Doctor (`/api/doctor`)

- `GET /api/doctor/directory` — List doctors (accessible by PATIENT, DOCTOR, ADMIN)
- `GET /api/doctor/profile` — Fetch currently logged-in doctor's profile
- `PUT /api/doctor/profile` — Update logged-in doctor's profile details
- `GET /api/doctor/appointments` — Retrieve appointments list scheduled with this doctor
- `GET /api/doctor/appointments/:appointmentId` — Retrieve details of a specific appointment
- `POST /api/doctor/appointments/:appointmentId/complete` — Complete an appointment, recording clinical findings and generating plain-language AI summary
- `GET /api/doctor/:doctorId` — Get a doctor profile by ID (accessible by PATIENT, DOCTOR, ADMIN)

### Booking (`/api/booking` - Alternate generic routes)

- `GET /api/booking/doctor/:doctorId/slots` — Check slots
- `POST /api/booking/hold` — Place slot hold
- `POST /api/booking/confirm` — Confirm hold
- `POST /api/booking/cancel` — Cancel hold or appointment

### Calendar (`/api/calendar`)

- `GET /api/calendar/connect` — Start the Google OAuth connection flow
- `GET /api/calendar/callback` — OAuth callback endpoint
- `GET /api/calendar/status` — Retrieve user's Google Calendar sync status

## Database Shape

```text
User -> RefreshToken, GoogleToken, Appointment
DoctorProfile -> LeaveDay, Appointment
Appointment -> MedicationReminder, NotificationLog
```

## LLM Prompts

The backend uses Gemini-based structured prompts:

- **Pre-visit symptom analysis** for identifying chief complaints, urgency levels, and generating suggested pre-consultation questions.
- **Post-visit note summarization** for translating technical clinical notes into plain-language follow-up guidance and extracting scheduled medication reminders.

Both integrations are wrapped in fallback handling, returning standard mock-up or default details if the Gemini API is offline or missing credentials.

## Google Calendar Setup

1. Create OAuth credentials in Google Cloud Console.
2. Add the backend callback URL (`/api/calendar/callback`) to the authorized redirect URIs.
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`.
4. Connect Google Calendar from the patient or doctor dashboard page.

## Tests

Run backend tests with:

```bash
cd backend && npm test
```

## Deployment

- **Backend**: Deploy to Render, run Prisma generate/migrate during build, and start `dist/server.js`.
- **Frontend**: Deploy to Vercel with `frontend/` as the root directory and `NEXT_PUBLIC_API_URL` pointing at the Render API.
