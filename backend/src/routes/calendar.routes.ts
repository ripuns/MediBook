import { Router } from 'express';

import {
  calendarCallbackController,
  calendarConnectController,
  calendarStatusController,
} from '../controllers/calendar.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/connect', requireAuth, calendarConnectController);
router.get('/callback', calendarCallbackController);
router.get('/status', requireAuth, calendarStatusController);

export default router;
