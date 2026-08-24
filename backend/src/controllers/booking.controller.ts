import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import {
  cancelSlot,
  generateSlots,
  holdSlot,
} from '../services/booking.service';
import { confirmAppointmentWithIntegrations } from './patient.controller';

export async function listDoctorSlotsController(req: Request, res: Response, next: NextFunction) {
  try {
    const doctorId = req.params.doctorId;
    const date = req.query.date as string | undefined;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Missing required date query parameter (YYYY-MM-DD).' });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const slotDurationMin = doctorProfile.slotDurationMin ?? 30;
    const workingHours = doctorProfile.workingHours as any;

    // Load leaves for the doctor that match the requested date
    const leaves = await prisma.leaveDay.findMany({ where: { doctorId, date: new Date(`${date}T00:00:00.000Z`) } });
    const leaveDates = leaves.map((l: (typeof leaves)[number]) => l.date);

    // Load appointments for the doctor on that date
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        slotStart: { gte: dayStart, lt: dayEnd },
        OR: [{ status: 'CONFIRMED' }, { status: 'HELD' }],
      },
    });

    const conflicts = appointments.map((a: (typeof appointments)[number]) => ({
      slotStart: a.slotStart,
      // Narrow the status to the SlotConflict expected literal types because the DB enum
      // contains more values but the query above restricts results to HELD or CONFIRMED.
      status: (a.status as unknown) as 'HELD' | 'CONFIRMED',
      holdExpiresAt: a.holdExpiresAt,
    }));

    const slots = generateSlots({ workingHours, slotDurationMin, date, leaveDates, conflicts });

    return res.status(200).json({ success: true, data: { slots } });
  } catch (error) {
    return next(error);
  }
}

export async function holdSlotController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { doctorId, slotStart, slotEnd } = req.body as { doctorId?: string; slotStart?: string; slotEnd?: string };

    if (!doctorId || !slotStart || !slotEnd) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields.' });
    }

    const result = await holdSlot({ prisma, doctorId, patientId: userId, slotStart, slotEnd });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

export async function confirmSlotController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const appointmentId = (req.body?.appointmentId ?? req.params?.appointmentId) as string | undefined;
    const { symptoms, preVisitSummary } = req.body as { symptoms?: string; preVisitSummary?: unknown };

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Missing appointmentId.' });
    }

    const result = await confirmAppointmentWithIntegrations({
      appointmentId,
      patientId: userId,
      symptoms,
      preVisitSummary,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

export async function cancelSlotController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const appointmentId = (req.body?.appointmentId ?? req.params?.appointmentId) as string | undefined;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Missing appointmentId.' });
    }

    const patientId = req.user?.role === 'PATIENT' ? userId : undefined;

    const result = await cancelSlot({ prisma, appointmentId, patientId });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}
