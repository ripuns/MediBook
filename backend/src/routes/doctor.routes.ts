import { Router } from 'express';

import {
  doctorAppointmentsController,
  doctorProfileController,
  updateDoctorProfileController,
} from '../controllers/doctor.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/profile', requireAuth, requireRole(['DOCTOR']), doctorProfileController);
router.put('/profile', requireAuth, requireRole(['DOCTOR']), updateDoctorProfileController);
router.get('/appointments', requireAuth, requireRole(['DOCTOR']), doctorAppointmentsController);

export default router;
