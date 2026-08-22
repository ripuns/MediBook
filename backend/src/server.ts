import 'dotenv/config';

import app from './app';
import { env } from './config/env';
import { startExpiredHoldCleanupJob } from './jobs/expiredHoldCleanup';

const port = env.PORT;

const expiredHoldCleanupJob = startExpiredHoldCleanupJob();
expiredHoldCleanupJob.start();

app.listen(port, () => {
  console.log(`MediBook backend listening on http://localhost:${port}`);
});
