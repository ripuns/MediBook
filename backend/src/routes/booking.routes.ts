import { Router } from 'express';

import {
  cancelSlotController,
  confirmSlotController,
  holdSlotController,
  listDoctorSlotsController,
} from '../controllers/booking.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Publicish: listing slots requires authentication in this implementation but could be exposed
// publicly in a different design. Keep it protected so we can rely on req.user for rate limits
// and personalized behaviour.
router.get('/doctor/:doctorId/slots', requireAuth, listDoctorSlotsController);

// Booking actions are patient-facing
router.post('/hold', requireAuth, requireRole(['PATIENT']), holdSlotController);
router.post('/confirm', requireAuth, requireRole(['PATIENT']), confirmSlotController);
router.post('/cancel', requireAuth, cancelSlotController);

export default router;
