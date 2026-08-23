import nodemailer from 'nodemailer';

import { prisma } from '../src/lib/prisma';
import { processNotification, queueNotification } from '../src/services/notification.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('MediBook notification queue', () => {
  const sendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GMAIL_USER = 'doctor@example.com';
    process.env.GMAIL_APP_PASSWORD = 'app-password';
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    sendMail.mockResolvedValue({ messageId: 'test-message-id' });
  });

  afterEach(() => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
  });

  it('queues an email notification and marks it sent after processing', async () => {
    const appointment = await prisma.appointment.create({
      data: {
        patient: {
          create: {
            email: `patient-${Date.now()}@example.com`,
            passwordHash: 'hashed-password',
            role: 'PATIENT',
            name: 'Patient',
          },
        },
        doctor: {
          create: {
            user: {
              create: {
                email: `doctor-${Date.now()}@example.com`,
                passwordHash: 'hashed-doctor-password',
                role: 'DOCTOR',
                name: 'Dr. Example',
              },
            },
            specialisation: 'Cardiology',
            slotDurationMin: 30,
            workingHours: {
              mon: ['09:00', '17:00'],
              tue: ['09:00', '17:00'],
              wed: ['09:00', '17:00'],
              thu: ['09:00', '17:00'],
              fri: ['09:00', '17:00'],
              sat: ['09:00', '13:00'],
              sun: null,
            },
          },
        },
        slotStart: new Date(Date.now() + 60 * 60 * 1000),
        slotEnd: new Date(Date.now() + 90 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    const queued = await queueNotification({
      appointmentId: appointment.id,
      type: 'BOOKING_CONFIRMATION',
      channel: 'EMAIL',
      payload: {
        to: 'patient@example.com',
        subject: 'Appointment confirmed',
        text: 'Your appointment is confirmed.',
      },
    });

    expect(queued.status).toBe('PENDING');

    const processed = await processNotification(queued.id);

    expect(processed.status).toBe('SENT');
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'patient@example.com',
      subject: 'Appointment confirmed',
      text: 'Your appointment is confirmed.',
    }));
  });

  it('gives up on notifications that exceed the retry limit', async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;

    const notification = await prisma.notificationLog.create({
      data: {
        type: 'APPOINTMENT_REMINDER',
        channel: 'EMAIL',
        status: 'FAILED',
        attempts: 4,
        payload: {
          to: 'patient@example.com',
          subject: 'Reminder',
          text: 'Your appointment is soon.',
        },
      },
    });

    const processed = await processNotification(notification.id);

    expect(processed.status).toBe('GAVE_UP');
    expect(processed.lastError).toBe('EMAIL_NOT_CONFIGURED');
    expect(sendMail).not.toHaveBeenCalled();
  });
});
