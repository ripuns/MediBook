import 'dotenv/config';

import app from './app';
import { env } from './config/env';
import { startExpiredHoldCleanupJob } from './jobs/expiredHoldCleanup';
import { startNotificationRetryJob } from './jobs/notificationRetry';

const port = env.PORT;

const expiredHoldCleanupJob = startExpiredHoldCleanupJob();
const notificationRetryJob = startNotificationRetryJob();

expiredHoldCleanupJob.start();
notificationRetryJob.start();

app.listen(port, () => {
  console.log(`MediBook backend listening on http://localhost:${port}`);
});
