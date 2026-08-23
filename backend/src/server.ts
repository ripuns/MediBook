import 'dotenv/config';

import app from './app';
import { env } from './config/env';
import { startAppointmentReminderJob } from './jobs/appointmentReminder.job';
import { startExpiredHoldCleanupJob } from './jobs/expiredHoldCleanup';
import { startMedicationReminderJob } from './jobs/medicationReminder.job';
import { startNotificationRetryJob } from './jobs/notificationRetry';

const port = env.PORT;

const expiredHoldCleanupJob = startExpiredHoldCleanupJob();
const notificationRetryJob = startNotificationRetryJob();
const appointmentReminderJob = startAppointmentReminderJob();
const medicationReminderJob = startMedicationReminderJob();

expiredHoldCleanupJob.start();
notificationRetryJob.start();
appointmentReminderJob.start();
medicationReminderJob.start();

app.listen(port, () => {
  console.log(`MediBook backend listening on http://localhost:${port}`);
});
