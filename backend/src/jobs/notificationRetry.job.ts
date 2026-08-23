import cron from 'node-cron';

import { prisma } from '../lib/prisma';
import { processNotification } from '../services/notification.service';

const backoffMinutes = [5, 15, 30];

export async function retryFailedNotifications() {
  const now = new Date();

  const notifications = await prisma.notificationLog.findMany({
    where: {
      status: 'FAILED',
      attempts: {
        lt: 3,
      },
    },
  });

  let processed = 0;

  for (const notification of notifications) {
    const attemptIndex = Math.min(notification.attempts, backoffMinutes.length - 1);
    const waitMinutes = backoffMinutes[attemptIndex];
    const retryAt = new Date(now.getTime() - waitMinutes * 60 * 1000);

    if (notification.updatedAt > retryAt) {
      continue;
    }

    await processNotification(notification.id);
    processed += 1;
  }

  return processed;
}

export function startNotificationRetryJob() {
  return cron.schedule('*/5 * * * *', async () => {
    try {
      const processed = await retryFailedNotifications();

      if (processed > 0) {
        console.log(`Retried ${processed} failed notification(s).`);
      }
    } catch (error) {
      console.error('Notification retry job failed:', error);
    }
  });
}
