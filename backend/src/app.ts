import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';

import { env } from './config/env';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import calendarRoutes from './routes/calendar.routes';
import doctorRoutes from './routes/doctor.routes';
import patientRoutes from './routes/patient.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Allow the frontend origin to talk to the API while keeping credentials enabled.
// We keep a localhost fallback so the app still starts even if FRONTEND_URL is missing in dev.
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediBook backend is healthy.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/calendar', calendarRoutes);

// Route-level errors are normalised here so all controllers can throw domain errors
// without custom response formatting in each route handler.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  errorHandler(error, _req, res, _next);
});

export default app;
