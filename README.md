# MediBook

MediBook is a healthcare appointment and follow-up manager with three portals: Patient, Doctor, and Admin. The app handles doctor discovery, slot holds, appointment confirmation, visit summaries, calendar connectivity, leave handling, and notification workflows.

## Tech Stack

- Backend: Node.js 20, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod, Nodemailer, Google Calendar API, node-cron
- Frontend: Next.js, TypeScript, Tailwind CSS, Axios, React Context, shadcn/ui, lucide-react

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
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_API_URL=
```

Frontend uses:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Admin:

- `GET /api/admin/overview`
- `GET /api/admin/doctors`
- `POST /api/admin/doctors`
- `PUT /api/admin/doctors/:id`
- `DELETE /api/admin/doctors/:id`
- `POST /api/admin/doctors/:id/leave`
- `DELETE /api/admin/doctors/:id/leave/:leaveId`

Patient:

- `GET /api/patient/appointments`
- `GET /api/doctor/directory`
- `GET /api/doctor/:doctorId`
- `GET /api/booking/doctor/:doctorId/slots?date=YYYY-MM-DD`
- `POST /api/booking/hold`
- `POST /api/booking/confirm`
- `POST /api/booking/cancel`

Doctor:

- `GET /api/doctor/appointments`
- `GET /api/doctor/profile`
- `PUT /api/doctor/profile`
- `POST /api/doctor/appointments/:appointmentId/complete`

Calendar:

- `GET /api/calendar/connect`
- `GET /api/calendar/callback`
- `GET /api/calendar/status`

## Database Shape

```text
User -> RefreshToken, GoogleToken, Appointment
DoctorProfile -> LeaveDay, Appointment
Appointment -> MedicationReminder, NotificationLog
```

## LLM Prompts

The backend uses two structured prompts:

- pre-visit symptom analysis for urgency, chief complaint, and suggested questions
- post-visit note summarization for plain-language follow-up guidance

Both calls are wrapped in fallback handling so booking and completion still work when the model is unavailable.

## Google Calendar Setup

1. Create OAuth credentials in Google Cloud.
2. Add the backend callback URL to the authorized redirect URIs.
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`.
4. Connect from the patient or doctor dashboard.

## Tests

Run backend tests with:

```bash
cd backend && npm test
```

## Deployment

- Backend: deploy to Render, run Prisma generate/migrate during build, and start `dist/server.js`.
- Frontend: deploy to Vercel with `frontend/` as the root directory and `NEXT_PUBLIC_API_URL` pointing at the Render API.
