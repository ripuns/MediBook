import { Router } from 'express';

import {
  adminOverviewController,
  createAdminDoctorController,
  createAdminLeaveController,
  deleteAdminDoctorController,
  deleteAdminLeaveController,
  getAdminDoctorController,
  listAdminAppointmentsController,
  listAdminDoctorsController,
  listAdminNotificationsController,
  updateAdminDoctorController,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/overview', requireAuth, requireRole(['ADMIN']), adminOverviewController);
router.get('/appointments', requireAuth, requireRole(['ADMIN']), listAdminAppointmentsController);
router.get('/notifications', requireAuth, requireRole(['ADMIN']), listAdminNotificationsController);
router.get('/doctors', requireAuth, requireRole(['ADMIN']), listAdminDoctorsController);
router.get('/doctors/:id', requireAuth, requireRole(['ADMIN']), getAdminDoctorController);
router.post('/doctors', requireAuth, requireRole(['ADMIN']), createAdminDoctorController);
router.put('/doctors/:id', requireAuth, requireRole(['ADMIN']), updateAdminDoctorController);
router.delete('/doctors/:id', requireAuth, requireRole(['ADMIN']), deleteAdminDoctorController);
router.post('/doctors/:id/leave', requireAuth, requireRole(['ADMIN']), createAdminLeaveController);
router.delete('/doctors/:id/leave/:leaveId', requireAuth, requireRole(['ADMIN']), deleteAdminLeaveController);

export default router;
