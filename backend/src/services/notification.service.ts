import { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { sendEmail } from './email.service';

export const MAX_NOTIFICATION_ATTEMPTS = 3;

export type NotificationPayload = Record<string, unknown> & {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};

export type QueueNotificationInput = {
  appointmentId?: string | null;
  type: string;
  channel: 'EMAIL' | 'CALENDAR';
  payload?: NotificationPayload | null;
};

async function sendEmailNotification(payload: NotificationPayload) {
  const to = typeof payload.to === 'string' && payload.to.trim().length > 0 ? payload.to : undefined;
  const subject = typeof payload.subject === 'string' && payload.subject.trim().length > 0 ? payload.subject : 'MediBook notification';
  const text = typeof payload.text === 'string' && payload.text.trim().length > 0 ? payload.text : 'You have a new notification from MediBook.';

  if (!to) {
    throw new Error('EMAIL_RECIPIENT_MISSING');
  }

  await sendEmail({
    to,
    subject,
    text,
    html: typeof payload.html === 'string' && payload.html.trim().length > 0 ? payload.html : undefined,
  });
}

export async function queueNotification({ appointmentId, type, channel, payload }: QueueNotificationInput) {
  const normalisedPayload = { ...(payload ?? {}) } as NotificationPayload;

  return prisma.notificationLog.create({
    data: {
      appointmentId: appointmentId ?? null,
      type,
      channel,
      status: 'PENDING',
      attempts: 0,
      payload: normalisedPayload as Prisma.InputJsonValue,
    },
  });
}

export async function processNotification(notificationId: string) {
  const notification = await prisma.notificationLog.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error('Notification not found.');
  }

  const nextAttempt = notification.attempts + 1;
  const payload = (notification.payload as NotificationPayload | null) ?? {};

  try {
    if (notification.channel === 'EMAIL') {
      await sendEmailNotification(payload);
    } else {
      throw new Error('Google Calendar notifications are not configured yet.');
    }

    return prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        status: 'SENT',
        attempts: nextAttempt,
        lastError: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown notification error';
    const shouldGiveUp = nextAttempt >= MAX_NOTIFICATION_ATTEMPTS;

    return prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        status: shouldGiveUp ? 'GAVE_UP' : 'FAILED',
        attempts: nextAttempt,
        lastError: message,
      },
    });
  }
}

export async function processQueuedNotifications(limit = 25): Promise<number> {
  const notifications = await prisma.notificationLog.findMany({
    where: {
      status: {
        in: ['PENDING', 'FAILED'],
      },
      attempts: {
        lt: MAX_NOTIFICATION_ATTEMPTS,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit,
  });

  let processed = 0;

  for (const notification of notifications) {
    await processNotification(notification.id);
    processed += 1;
  }

  return processed;
}
