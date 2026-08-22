import { Router } from 'express';

import { patientAppointmentsController } from '../controllers/patient.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/appointments', requireAuth, requireRole(['PATIENT']), patientAppointmentsController);

export default router;
