import type { PrismaClient } from '@prisma/client';

export async function getDoctorProfileByUserId(prisma: PrismaClient, userId: string) {
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!doctorProfile) {
    const error = new Error('Doctor profile not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  return doctorProfile;
}

export async function updateDoctorProfile(
  prisma: PrismaClient,
  userId: string,
  input: {
    specialisation?: string;
    bio?: string | null;
    workingHours?: Record<string, [string, string] | null>;
    slotDurationMin?: number;
  },
) {
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId },
  });

  if (!doctorProfile) {
    const error = new Error('Doctor profile not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  return prisma.doctorProfile.update({
    where: { id: doctorProfile.id },
    data: {
      ...(input.specialisation !== undefined ? { specialisation: input.specialisation } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.workingHours !== undefined ? { workingHours: input.workingHours } : {}),
      ...(input.slotDurationMin !== undefined ? { slotDurationMin: input.slotDurationMin } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getDoctorAppointments(prisma: PrismaClient, userId: string) {
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!doctorProfile) {
    const error = new Error('Doctor profile not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  return prisma.appointment.findMany({
    where: { doctorId: doctorProfile.id },
    orderBy: { slotStart: 'asc' },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
