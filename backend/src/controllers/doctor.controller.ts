import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { getDoctorAppointments, getDoctorProfileByUserId, updateDoctorProfile } from '../services/doctor.service';

export async function doctorProfileController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const profile = await getDoctorProfileByUserId(prisma, userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateDoctorProfileController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const profile = await updateDoctorProfile(prisma, userId, req.body ?? {});

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
}

export async function doctorAppointmentsController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const appointments = await getDoctorAppointments(prisma, userId);

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    return next(error);
  }
}
