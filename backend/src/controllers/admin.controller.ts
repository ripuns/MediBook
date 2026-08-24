import bcrypt from 'bcrypt';
import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { getAdminOverview } from '../services/admin.service';
import { cancelDoctorLeaveById, createDoctorLeave } from '../services/leave.service';

const workingHoursDefaults = {
  mon: ['09:00', '17:00'],
  tue: ['09:00', '17:00'],
  wed: ['09:00', '17:00'],
  thu: ['09:00', '17:00'],
  fri: ['09:00', '17:00'],
  sat: null,
  sun: null,
};

export async function adminOverviewController(_req: Request, res: Response, next: NextFunction) {
  try {
    const overview = await getAdminOverview(prisma);

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminAppointmentsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, doctorId, date } = req.query as {
      status?: string;
      doctorId?: string;
      date?: string;
    };

    const dateFilter = date
      ? {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        }
      : undefined;

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(doctorId ? { doctorId } : {}),
        ...(dateFilter ? { slotStart: dateFilter } : {}),
      },
      orderBy: { slotStart: 'desc' },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminNotificationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query as { status?: string };

    const notifications = await prisma.notificationLog.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, name: true, email: true } },
            doctor: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminDoctorsController(_req: Request, res: Response, next: NextFunction) {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: doctors.map((doctor) => ({
        id: doctor.id,
        userId: doctor.userId,
        name: doctor.user.name,
        email: doctor.user.email,
        specialisation: doctor.specialisation,
        slotDurationMin: doctor.slotDurationMin,
        workingHours: doctor.workingHours,
        bio: doctor.bio,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createAdminDoctorController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, specialisation, slotDurationMin, workingHours, bio } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      specialisation?: string;
      slotDurationMin?: number;
      workingHours?: Record<string, [string, string] | null>;
      bio?: string | null;
    };

    if (!name || !email || !password || !specialisation) {
      return res.status(400).json({ success: false, message: 'Missing required doctor fields.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: 'DOCTOR',
        },
      });

      const profile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          specialisation,
          slotDurationMin: slotDurationMin ?? 30,
          workingHours: workingHours ?? workingHoursDefaults,
          bio: bio ?? null,
        },
      });

      return {
        id: profile.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        specialisation: profile.specialisation,
        slotDurationMin: profile.slotDurationMin,
        workingHours: profile.workingHours,
        bio: profile.bio,
      };
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

export async function updateAdminDoctorController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { specialisation, slotDurationMin, workingHours, bio } = req.body as {
      specialisation?: string;
      slotDurationMin?: number;
      workingHours?: Record<string, [string, string] | null>;
      bio?: string | null;
    };

    const doctor = await prisma.doctorProfile.findUnique({ where: { id } });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const updated = await prisma.doctorProfile.update({
      where: { id },
      data: {
        ...(specialisation !== undefined ? { specialisation } : {}),
        ...(slotDurationMin !== undefined ? { slotDurationMin } : {}),
        ...(workingHours !== undefined ? { workingHours } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        userId: updated.userId,
        name: updated.user.name,
        email: updated.user.email,
        specialisation: updated.specialisation,
        slotDurationMin: updated.slotDurationMin,
        workingHours: updated.workingHours,
        bio: updated.bio,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdminDoctorController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.doctorProfile.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Doctor deleted.' });
  } catch (error) {
    return next(error);
  }
}

export async function createAdminLeaveController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { date, reason } = req.body as { date?: string; reason?: string };

    if (!date) {
      return res.status(400).json({ success: false, message: 'Missing leave date.' });
    }

    const leaveDay = await createDoctorLeave({
      prisma,
      doctorId: id,
      date,
      reason: reason ?? null,
    });

    return res.status(201).json({
      success: true,
      data: {
        leaveDay,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdminLeaveController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, leaveId } = req.params;
    const result = await cancelDoctorLeaveById({ prisma, doctorId: id, leaveId });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}
