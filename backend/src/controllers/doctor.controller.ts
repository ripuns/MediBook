import type { NextFunction, Request, Response } from 'express';

import { deleteEvent } from '../lib/calendar';
import { prisma } from '../lib/prisma';
import { summariseVisit } from '../services/llm.service';
import { queueNotification } from '../services/notification.service';
import { getDoctorAppointments, getDoctorProfileByUserId, updateDoctorProfile } from '../services/doctor.service';

export async function listDoctorsController(_req: Request, res: Response, next: NextFunction) {
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
    });

    return res.status(200).json({
      success: true,
      data: doctors.map((doctor) => ({
        id: doctor.id,
        userId: doctor.userId,
        name: doctor.user.name,
        email: doctor.user.email,
        specialisation: doctor.specialisation,
        bio: doctor.bio,
        slotDurationMin: doctor.slotDurationMin,
        workingHours: doctor.workingHours,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function doctorByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const { doctorId } = req.params;
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
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

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: doctor.id,
        userId: doctor.userId,
        name: doctor.user.name,
        email: doctor.user.email,
        specialisation: doctor.specialisation,
        bio: doctor.bio,
        slotDurationMin: doctor.slotDurationMin,
        workingHours: doctor.workingHours,
      },
    });
  } catch (error) {
    return next(error);
  }
}

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

export async function doctorAppointmentByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;
    const { appointmentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.',
      });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctorProfile.id,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeAppointmentWithIntegrations({
  appointmentId,
  doctorUserId,
  notes,
  postVisitSummary,
}: {
  appointmentId: string;
  doctorUserId: string;
  notes?: string | null;
  postVisitSummary?: unknown;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!appointment) {
    const error = new Error('Appointment not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const generatedSummary = postVisitSummary ?? (await summariseVisit(notes ?? 'No consultation notes provided.'));

  const completedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'COMPLETED',
      postVisitNotes: notes ?? appointment.postVisitNotes,
      postVisitSummary: generatedSummary as any,
      prescription: generatedSummary && typeof generatedSummary === 'object' && 'medicationSchedule' in generatedSummary
        ? ({ medicationSchedule: (generatedSummary as { medicationSchedule?: unknown[] }).medicationSchedule ?? [] } as any)
        : (appointment.prescription as any),
    },
  });

  await queueNotification({
    appointmentId,
    type: 'appointment_completed_patient',
    channel: 'EMAIL',
    payload: {
      to: appointment.patient.email,
      subject: 'Your visit summary is ready',
      text: `Your follow-up summary from Dr. ${appointment.doctor.user.name} is ready.`,
      html: `<p>Your follow-up summary is ready.</p><p>${generatedSummary && typeof generatedSummary === 'object' && 'summary' in generatedSummary ? String((generatedSummary as { summary?: string }).summary ?? '') : 'Summary generated successfully.'}</p>`,
    },
  });

  if (appointment.googleEventIdPatient) {
    try {
      await deleteEvent(appointment.patient.id, appointment.googleEventIdPatient);
      await prisma.appointment.update({ where: { id: appointmentId }, data: { googleEventIdPatient: null } });
    } catch (error) {
      console.warn('Failed to delete patient calendar event after appointment completion:', error);
    }
  }

  if (appointment.googleEventIdDoctor) {
    try {
      await deleteEvent(appointment.doctor.user.id, appointment.googleEventIdDoctor);
      await prisma.appointment.update({ where: { id: appointmentId }, data: { googleEventIdDoctor: null } });
    } catch (error) {
      console.warn('Failed to delete doctor calendar event after appointment completion:', error);
    }
  }

  return completedAppointment;
}

export async function doctorCompleteAppointmentController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;
    const { appointmentId } = req.params;
    const { notes, postVisitSummary } = req.body as { notes?: string; postVisitSummary?: unknown };

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Missing appointmentId.' });
    }

    const result = await completeAppointmentWithIntegrations({
      appointmentId,
      doctorUserId: userId,
      notes,
      postVisitSummary,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}
