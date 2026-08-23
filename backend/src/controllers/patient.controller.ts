import type { NextFunction, Request, Response } from 'express';

import { createEvent, getTokens } from '../lib/calendar';
import { prisma } from '../lib/prisma';
import { confirmSlot } from '../services/booking.service';
import { analyseSymptoms } from '../services/llm.service';
import { queueNotification } from '../services/notification.service';
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

export async function confirmAppointmentWithIntegrations({
  appointmentId,
  patientId,
  symptoms,
  preVisitSummary,
}: {
  appointmentId: string;
  patientId: string;
  symptoms?: string | null;
  preVisitSummary?: unknown;
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

  const generatedSummary = preVisitSummary ?? (await analyseSymptoms(symptoms ?? 'No symptoms provided.'));

  const confirmedAppointment = await confirmSlot({
    prisma,
    appointmentId,
    patientId,
    symptoms,
    preVisitSummary: generatedSummary as any,
  });

  const patientEmailPayload = {
    to: appointment.patient.email,
    subject: 'Appointment confirmed with MediBook',
    text: `Your appointment with Dr. ${appointment.doctor.user.name} is confirmed for ${new Date(appointment.slotStart).toISOString()}.`,
    html: `<p>Your appointment with Dr. ${appointment.doctor.user.name} is confirmed.</p><p>Pre-visit summary: ${generatedSummary && typeof generatedSummary === 'object' && 'chiefComplaint' in generatedSummary ? String((generatedSummary as { chiefComplaint?: string }).chiefComplaint ?? '') : 'AI summary available.'}</p>`,
  };

  await queueNotification({
    appointmentId,
    type: 'appointment_confirmed_patient',
    channel: 'EMAIL',
    payload: patientEmailPayload,
  });

  await queueNotification({
    appointmentId,
    type: 'appointment_confirmed_doctor',
    channel: 'EMAIL',
    payload: {
      to: appointment.doctor.user.email,
      subject: 'New MediBook appointment confirmed',
      text: `A patient has confirmed an appointment with you on ${new Date(appointment.slotStart).toISOString()}.`,
      html: `<p>A patient has confirmed an appointment with you on ${new Date(appointment.slotStart).toISOString()}.</p>`,
    },
  });

  try {
    const patientGoogleToken = await getTokens(appointment.patient.id);
    if (patientGoogleToken) {
      const patientEvent = await createEvent(appointment.patient.id, {
        summary: `MediBook appointment with Dr. ${appointment.doctor.user.name}`,
        description: `Appointment with ${appointment.doctor.user.name}. Symptoms: ${symptoms ?? 'Not provided'}`,
        start: { dateTime: new Date(appointment.slotStart).toISOString() },
        end: { dateTime: new Date(appointment.slotEnd).toISOString() },
      });

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { googleEventIdPatient: patientEvent.id ?? null },
      });
    }
  } catch (error) {
    console.warn('Patient calendar event creation failed during booking confirmation:', error);
  }

  try {
    const doctorGoogleToken = await getTokens(appointment.doctor.user.id);
    if (doctorGoogleToken) {
      const doctorEvent = await createEvent(appointment.doctor.user.id, {
        summary: `Consultation with ${appointment.patient.name}`,
        description: `Consultation with ${appointment.patient.name}. Symptoms: ${symptoms ?? 'Not provided'}`,
        start: { dateTime: new Date(appointment.slotStart).toISOString() },
        end: { dateTime: new Date(appointment.slotEnd).toISOString() },
      });

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { googleEventIdDoctor: doctorEvent.id ?? null },
      });
    }
  } catch (error) {
    console.warn('Doctor calendar event creation failed during booking confirmation:', error);
  }

  return confirmedAppointment;
}
