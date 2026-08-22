import { Prisma, PrismaClient } from '@prisma/client';

export type SlotConflict = {
  slotStart: string | Date;
  status: 'CONFIRMED' | 'HELD';
  holdExpiresAt?: string | Date | null;
};

export type WorkingHoursMap = {
  mon?: [string, string] | null;
  tue?: [string, string] | null;
  wed?: [string, string] | null;
  thu?: [string, string] | null;
  fri?: [string, string] | null;
  sat?: [string, string] | null;
  sun?: [string, string] | null;
};

export function generateSlots({
  workingHours,
  slotDurationMin,
  date,
  leaveDates = [],
  conflicts = [],
  now = new Date(),
}: {
  workingHours: WorkingHoursMap | null | undefined;
  slotDurationMin: number;
  date: string | Date;
  leaveDates?: Array<string | Date>;
  conflicts?: SlotConflict[];
  now?: Date;
}): string[] {
  if (!workingHours || !slotDurationMin || slotDurationMin <= 0) {
    return [];
  }

  const targetDate = typeof date === 'string' ? new Date(`${date}T00:00:00.000Z`) : new Date(date);
  const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][targetDate.getUTCDay()] as keyof WorkingHoursMap;
  const daySchedule = workingHours[dayKey];

  if (!daySchedule || !Array.isArray(daySchedule) || daySchedule.length !== 2) {
    return [];
  }

  const leaveDateSet = new Set(
    leaveDates.map((value) => {
      const nextDate = typeof value === 'string' ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
      return nextDate.toISOString().slice(0, 10);
    }),
  );

  if (leaveDateSet.has(targetDate.toISOString().slice(0, 10))) {
    return [];
  }

  const [workStart, workEnd] = daySchedule;
  const startMinutes = timeToMinutes(workStart);
  const endMinutes = timeToMinutes(workEnd);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || startMinutes >= endMinutes) {
    return [];
  }

  const slots: string[] = [];

  for (let cursor = startMinutes; cursor + slotDurationMin <= endMinutes; cursor += slotDurationMin) {
    const slotStart = new Date(targetDate);
    slotStart.setUTCHours(0, 0, 0, 0);
    slotStart.setUTCMinutes(slotStart.getUTCMinutes() + cursor);

    if (slotStart.getTime() < now.getTime()) {
      continue;
    }

    const slotStartIso = slotStart.toISOString();
    const isOccupied = conflicts.some((conflict) => {
      const conflictStart = new Date(conflict.slotStart).getTime();
      const conflictEnd = conflict.holdExpiresAt ? new Date(conflict.holdExpiresAt).getTime() : conflictStart;

      if (conflict.status === 'CONFIRMED') {
        return conflictStart === slotStart.getTime();
      }

      return conflict.status === 'HELD' && conflictEnd > now.getTime() && conflictStart === slotStart.getTime();
    });

    if (!isOccupied) {
      slots.push(slotStartIso);
    }
  }

  return slots;
}

export async function holdSlot({
  prisma,
  doctorId,
  patientId,
  slotStart,
  slotEnd,
}: {
  prisma: PrismaClient;
  doctorId: string;
  patientId: string;
  slotStart: Date | string;
  slotEnd: Date | string;
}) {
  const start = new Date(slotStart);
  const end = new Date(slotEnd);

  // We do the conflict check and insert inside a single transaction so two near-simultaneous
  // requests cannot both pass the same availability check before either one writes.
  return prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        doctorId,
        slotStart: start,
        OR: [
          { status: 'CONFIRMED' },
          {
            status: 'HELD',
            holdExpiresAt: { gt: new Date() },
          },
        ],
      },
    });

    if (conflict) {
      const error = new Error('SLOT_TAKEN') as Error & { statusCode?: number };
      error.statusCode = 409;
      throw error;
    }

    return tx.appointment.create({
      data: {
        patientId,
        doctorId,
        slotStart: start,
        slotEnd: end,
        status: 'HELD',
        holdExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  });
}

export async function confirmSlot({
  prisma,
  appointmentId,
  patientId,
  symptoms,
  preVisitSummary,
}: {
  prisma: PrismaClient;
  appointmentId: string;
  patientId: string;
  symptoms?: string | null;
  preVisitSummary?: Prisma.InputJsonValue;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    const error = new Error('Appointment not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  if (appointment.patientId !== patientId) {
    const error = new Error('This appointment does not belong to the current patient.') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  // We clear the temporary hold once the patient confirms so the slot becomes a formal booking
  // instead of a five-minute reservation that can still be treated as pending.
  const nextPreVisitSummary =
    preVisitSummary !== undefined ? preVisitSummary : appointment.preVisitSummary ?? Prisma.JsonNull;

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CONFIRMED',
      symptoms: symptoms ?? appointment.symptoms,
      preVisitSummary: nextPreVisitSummary,
      holdExpiresAt: null,
    },
  });
}

export async function cancelSlot({
  prisma,
  appointmentId,
  patientId,
}: {
  prisma: PrismaClient;
  appointmentId: string;
  patientId?: string;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    const error = new Error('Appointment not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  if (patientId && appointment.patientId !== patientId) {
    const error = new Error('This appointment does not belong to the current user.') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED',
      holdExpiresAt: null,
    },
  });
}

function timeToMinutes(value: string): number {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());

  if (!match) {
    return Number.NaN;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}
