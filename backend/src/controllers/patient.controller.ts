import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { getPatientAppointments } from '../services/patient.service';

export async function patientAppointmentsController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const appointments = await getPatientAppointments(prisma, userId);

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    return next(error);
  }
}
