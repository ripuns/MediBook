import type { PrismaClient } from '@prisma/client';

export async function getAdminOverview(prisma: PrismaClient) {
  const [userCount, doctorCount, patientCount, appointmentCount, pendingHoldCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        status: 'HELD',
        holdExpiresAt: {
          gt: new Date(),
        },
      },
    }),
  ]);

  return {
    userCount,
    doctorCount,
    patientCount,
    appointmentCount,
    pendingHoldCount,
  };
}
