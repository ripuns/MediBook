import cron from 'node-cron';

import { prisma } from '../lib/prisma';
import { queueNotification } from '../services/notification.service';

export async function sendDueMedicationReminders() {
  const now = new Date();

  const reminders = await prisma.medicationReminder.findMany({
    where: {
      sent: false,
      scheduledAt: {
        lte: now,
      },
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  let processed = 0;

  for (const reminder of reminders) {
    const patientEmail = reminder.appointment.patient.email;

    if (!patientEmail) {
      await prisma.medicationReminder.update({
        where: { id: reminder.id },
        data: { sent: true },
      });
      processed += 1;
      continue;
    }

    await queueNotification({
      appointmentId: reminder.appointmentId,
      type: 'MEDICATION_REMINDER',
      channel: 'EMAIL',
      payload: {
        to: patientEmail,
        subject: `Medication reminder: ${reminder.drugName}`,
        text: `This is a reminder to take ${reminder.drugName}. Frequency: ${reminder.frequency}.`,
      },
    });

    await prisma.medicationReminder.update({
      where: { id: reminder.id },
      data: {
        sent: true,
        attempts: reminder.attempts + 1,
      },
    });

    processed += 1;
  }

  return processed;
}

export function startMedicationReminderJob() {
  return cron.schedule('*/5 * * * *', async () => {
    try {
      const processed = await sendDueMedicationReminders();

      if (processed > 0) {
        console.log(`Queued ${processed} medication reminder(s).`);
      }
    } catch (error) {
      console.error('Medication reminder job failed:', error);
    }
  });
}
