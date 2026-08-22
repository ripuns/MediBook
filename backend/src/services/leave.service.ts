import type { PrismaClient } from '@prisma/client';

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

  return prisma.leaveDay.create({
    data: {
      doctorId: doctor.id,
      date: normalizedDate,
      reason: reason ?? null,
    },
  });
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
