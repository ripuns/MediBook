import cron from 'node-cron';

import { prisma } from '../lib/prisma';

export async function cleanupExpiredHeldSlots() {
  const now = new Date();

  const result = await prisma.appointment.updateMany({
    where: {
      status: 'HELD',
      holdExpiresAt: {
        lt: now,
      },
    },
    data: {
      status: 'CANCELLED',
      holdExpiresAt: null,
    },
  });

  return result.count;
}

export function startExpiredHoldCleanupJob() {
  return cron.schedule('*/1 * * * *', async () => {
    try {
      const expiredCount = await cleanupExpiredHeldSlots();

      if (expiredCount > 0) {
        console.log(`Released ${expiredCount} expired held appointment slot(s).`);
      }
    } catch (error) {
      console.error('Expired hold cleanup failed:', error);
    }
  });
}
