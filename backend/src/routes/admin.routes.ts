import { Router } from 'express';

import { adminOverviewController } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/overview', requireAuth, requireRole(['ADMIN']), adminOverviewController);

export default router;
