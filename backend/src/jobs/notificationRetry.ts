import cron from 'node-cron';

import { processQueuedNotifications } from '../services/notification.service';

export function startNotificationRetryJob() {
  return cron.schedule('*/5 * * * *', async () => {
    try {
      const processed = await processQueuedNotifications();

      if (processed > 0) {
        console.log(`Processed ${processed} queued notification(s).`);
      }
    } catch (error) {
      console.error('Notification retry job failed:', error);
    }
  });
}
