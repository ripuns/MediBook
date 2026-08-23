import type { PrismaClient } from '@prisma/client';

import { deleteEvent } from '../lib/calendar';
import { queueNotification } from './notification.service';

function toDateOnly(value: string | Date): Date {
  const nextDate = typeof value === 'string' ? new Date(value) : new Date(value.getTime());

  if (Number.isNaN(nextDate.getTime())) {
    const error = new Error('Invalid leave date.') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  const dateOnly = nextDate.toISOString().slice(0, 10);
  return new Date(`${dateOnly}T00:00:00.000Z`);
}

export async function createDoctorLeave({
  prisma,
  doctorId,
  date,
  reason,
}: {
  prisma: PrismaClient;
  doctorId: string;
  date: string | Date;
  reason?: string | null;
}) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { id: true },
  });

  if (!doctor) {
    const error = new Error('Doctor not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const normalizedDate = toDateOnly(date);

  const existingLeave = await prisma.leaveDay.findUnique({
    where: {
      doctorId_date: {
        doctorId: doctor.id,
        date: normalizedDate,
      },
    },
  });

  if (existingLeave) {
    const error = new Error('A leave entry already exists for this doctor on that date.') as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }

  const createdLeave = await prisma.leaveDay.create({
    data: {
      doctorId: doctor.id,
      date: normalizedDate,
      reason: reason ?? null,
    },
  });

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      slotStart: {
        gte: new Date(`${normalizedDate.toISOString().slice(0, 10)}T00:00:00.000Z`),
        lt: new Date(`${normalizedDate.toISOString().slice(0, 10)}T23:59:59.999Z`),
      },
      status: 'CONFIRMED',
    },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  for (const appointment of appointments) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        holdExpiresAt: null,
      },
    });

    await queueNotification({
      appointmentId: appointment.id,
      type: 'leave_cancelled',
      channel: 'EMAIL',
      payload: {
        to: appointment.patient.email,
        subject: 'Appointment cancelled due to doctor leave',
        text: `Your appointment on ${appointment.slotStart.toISOString()} has been cancelled because your doctor is on leave.`,
      },
    });

    if (appointment.googleEventIdPatient) {
      try {
        await deleteEvent(appointment.patient.id, appointment.googleEventIdPatient);
      } catch (error) {
        console.warn('Failed to delete patient calendar event for leave cancellation:', error);
      }
    }

    if (appointment.googleEventIdDoctor) {
      try {
        await deleteEvent(appointment.doctor.user.id, appointment.googleEventIdDoctor);
      } catch (error) {
        console.warn('Failed to delete doctor calendar event for leave cancellation:', error);
      }
    }
  }

  return createdLeave;
}

export async function listDoctorLeaves({
  prisma,
  doctorId,
  fromDate,
  toDate,
}: {
  prisma: PrismaClient;
  doctorId: string;
  fromDate?: string | Date;
  toDate?: string | Date;
}) {
  const doctorExists = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { id: true },
  });

  if (!doctorExists) {
    const error = new Error('Doctor not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const range = {
    doctorId,
    ...(fromDate || toDate
      ? {
          date: {
            ...(fromDate ? { gte: toDateOnly(fromDate) } : {}),
            ...(toDate ? { lte: toDateOnly(toDate) } : {}),
          },
        }
      : {}),
  };

  return prisma.leaveDay.findMany({
    where: range,
    orderBy: { date: 'asc' },
  });
}

export async function cancelDoctorLeave({
  prisma,
  doctorId,
  date,
}: {
  prisma: PrismaClient;
  doctorId: string;
  date: string | Date;
}) {
  const normalizedDate = toDateOnly(date);

  const leaveEntry = await prisma.leaveDay.findUnique({
    where: {
      doctorId_date: {
        doctorId,
        date: normalizedDate,
      },
    },
  });

  if (!leaveEntry) {
    const error = new Error('Leave not found for this doctor and date.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  await prisma.leaveDay.delete({
    where: { id: leaveEntry.id },
  });

  return {
    success: true,
    leaveId: leaveEntry.id,
    doctorId: leaveEntry.doctorId,
    date: leaveEntry.date,
  };
}

export async function cancelDoctorLeaveById({
  prisma,
  doctorId,
  leaveId,
}: {
  prisma: PrismaClient;
  doctorId: string;
  leaveId: string;
}) {
  const leaveEntry = await prisma.leaveDay.findUnique({
    where: { id: leaveId },
  });

  if (!leaveEntry) {
    const error = new Error('Leave not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  if (leaveEntry.doctorId !== doctorId) {
    const error = new Error('This leave record does not belong to the current doctor.') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  await prisma.leaveDay.delete({
    where: { id: leaveEntry.id },
  });

  return {
    success: true,
    leaveId: leaveEntry.id,
    doctorId: leaveEntry.doctorId,
    date: leaveEntry.date,
  };
}
