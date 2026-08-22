import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Enable JSON parsing and browser-safe cross-origin requests for the frontend.
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediBook backend is healthy.',
  });
});

app.use('/api/auth', authRoutes);

// Route-level errors are normalised here so all controllers can throw domain errors
// without custom response formatting in each route handler.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  errorHandler(error, _req, res, _next);
});

export default app;
