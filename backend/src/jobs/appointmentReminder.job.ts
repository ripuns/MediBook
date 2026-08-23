import cron from 'node-cron';

import { prisma } from '../lib/prisma';
import { queueNotification } from '../services/notification.service';

export async function sendAppointmentReminders() {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: 'CONFIRMED',
      slotStart: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    include: {
      patient: true,
      notifications: {
        where: {
          type: 'APPOINTMENT_REMINDER',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  let processed = 0;

  for (const appointment of appointments) {
    const hasRecentReminder = appointment.notifications.length > 0;

    if (hasRecentReminder) {
      continue;
    }

    if (!appointment.patient.email) {
      continue;
    }

    await queueNotification({
      appointmentId: appointment.id,
      type: 'APPOINTMENT_REMINDER',
      channel: 'EMAIL',
      payload: {
        to: appointment.patient.email,
        subject: 'Appointment reminder',
        text: `You have an appointment on ${appointment.slotStart.toISOString()}. Please arrive 10 minutes early.`,
      },
    });

    processed += 1;
  }

  return processed;
}

export function startAppointmentReminderJob() {
  return cron.schedule('0 * * * *', async () => {
    try {
      const processed = await sendAppointmentReminders();

      if (processed > 0) {
        console.log(`Queued ${processed} appointment reminder(s).`);
      }
    } catch (error) {
      console.error('Appointment reminder job failed:', error);
    }
  });
}
