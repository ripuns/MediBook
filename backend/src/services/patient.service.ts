import type { PrismaClient } from '@prisma/client';

export async function getPatientAppointments(prisma: PrismaClient, patientId: string) {
  return prisma.appointment.findMany({
    where: { patientId },
    orderBy: { slotStart: 'asc' },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
