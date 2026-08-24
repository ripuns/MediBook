import { Router } from 'express';

import { doctorByIdController, listDoctorsController } from '../controllers/doctor.controller';
import {
  cancelSlotController,
  confirmSlotController,
  holdSlotController,
  listDoctorSlotsController,
} from '../controllers/booking.controller';
import { patientAppointmentsController } from '../controllers/patient.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/appointments', requireAuth, requireRole(['PATIENT']), patientAppointmentsController);
router.get('/doctors', requireAuth, requireRole(['PATIENT']), listDoctorsController);
router.get('/doctors/:doctorId', requireAuth, requireRole(['PATIENT']), doctorByIdController);
router.get('/doctors/:doctorId/slots', requireAuth, requireRole(['PATIENT']), listDoctorSlotsController);
router.post('/appointments/hold', requireAuth, requireRole(['PATIENT']), holdSlotController);
router.put('/appointments/:appointmentId/confirm', requireAuth, requireRole(['PATIENT']), confirmSlotController);
router.put('/appointments/:appointmentId/cancel', requireAuth, requireRole(['PATIENT']), cancelSlotController);

export default router;
