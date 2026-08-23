import { Router } from 'express';

import {
  doctorAppointmentsController,
  doctorByIdController,
  doctorCompleteAppointmentController,
  doctorProfileController,
  listDoctorsController,
  updateDoctorProfileController,
} from '../controllers/doctor.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/directory', requireAuth, requireRole(['PATIENT', 'DOCTOR', 'ADMIN']), listDoctorsController);
router.get('/profile', requireAuth, requireRole(['DOCTOR']), doctorProfileController);
router.put('/profile', requireAuth, requireRole(['DOCTOR']), updateDoctorProfileController);
router.get('/appointments', requireAuth, requireRole(['DOCTOR']), doctorAppointmentsController);
router.post('/appointments/:appointmentId/complete', requireAuth, requireRole(['DOCTOR']), doctorCompleteAppointmentController);
router.get('/:doctorId', requireAuth, requireRole(['PATIENT', 'DOCTOR', 'ADMIN']), doctorByIdController);

export default router;
