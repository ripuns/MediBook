import request from 'supertest';

import app from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('MediBook booking API', () => {
  async function createDoctorAndPatient() {
    const tag = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const targetDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    targetDate.setUTCHours(0, 0, 0, 0);
    const date = targetDate.toISOString().slice(0, 10);

    const doctorUser = await prisma.user.create({
      data: {
        email: `doctor-${tag}@example.com`,
        passwordHash: 'hashed-doctor-password',
        role: 'DOCTOR',
        name: 'Dr. Booking',
      },
    });

    const doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: doctorUser.id,
        specialisation: 'Cardiology',
        slotDurationMin: 30,
        workingHours: {
          mon: ['09:00', '17:00'],
          tue: ['09:00', '17:00'],
          wed: ['09:00', '17:00'],
          thu: ['09:00', '17:00'],
          fri: ['09:00', '17:00'],
          sat: ['09:00', '13:00'],
          sun: null,
        },
      },
    });

    const patientResponse = await request(app).post('/api/auth/register').send({
      name: 'Booking Patient',
      email: `patient-${tag}@example.com`,
      password: 'Password123!',
      role: 'PATIENT',
    });

    return {
      doctorId: doctorProfile.id,
      patientId: patientResponse.body.data.user.id,
      accessToken: patientResponse.body.data.tokens.accessToken,
      date,
    };
  }

  it('lists available slots and lets a patient hold and confirm a slot', async () => {
    const { doctorId, accessToken, date } = await createDoctorAndPatient();

    const listResponse = await request(app)
      .get(`/api/booking/doctor/${doctorId}/slots?date=${date}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data.slots.length).toBeGreaterThan(0);

    const slotStart = listResponse.body.data.slots[0];
    const slotStartDate = new Date(slotStart);
    const slotEnd = new Date(slotStartDate.getTime() + 30 * 60 * 1000).toISOString();

    const holdResponse = await request(app)
      .post('/api/booking/hold')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        doctorId,
        slotStart,
        slotEnd,
      });

    expect(holdResponse.status).toBe(201);
    expect(holdResponse.body.success).toBe(true);

    const appointmentId = holdResponse.body.data.id;

    const confirmResponse = await request(app)
      .post('/api/booking/confirm')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ appointmentId, symptoms: 'Mild fatigue' });

    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.success).toBe(true);
    expect(confirmResponse.body.data.status).toBe('CONFIRMED');
  });

  it('ignores expired holds for availability and blocks duplicate holds for the same slot', async () => {
    const { doctorId, patientId, accessToken, date } = await createDoctorAndPatient();

    const listResponse = await request(app)
      .get(`/api/booking/doctor/${doctorId}/slots?date=${date}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listResponse.status).toBe(200);
    const slotStart = listResponse.body.data.slots[0];
    expect(slotStart).toBeTruthy();

    const slotStartDate = new Date(slotStart);
    const slotEnd = new Date(slotStartDate.getTime() + 30 * 60 * 1000).toISOString();

    await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        slotStart: slotStartDate,
        slotEnd: new Date(slotStartDate.getTime() + 30 * 60 * 1000),
        status: 'HELD',
        holdExpiresAt: new Date(Date.now() - 60 * 1000),
      },
    });

    const refreshedSlotsResponse = await request(app)
      .get(`/api/booking/doctor/${doctorId}/slots?date=${date}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(refreshedSlotsResponse.status).toBe(200);
    expect(refreshedSlotsResponse.body.data.slots).toContain(slotStart);

    const holdResponse = await request(app)
      .post('/api/booking/hold')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        doctorId,
        slotStart,
        slotEnd,
      });

    expect(holdResponse.status).toBe(201);

    const duplicateHoldResponse = await request(app)
      .post('/api/booking/hold')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        doctorId,
        slotStart,
        slotEnd,
      });

    expect(duplicateHoldResponse.status).toBe(409);
    expect(duplicateHoldResponse.body.success).toBe(false);
  });
});
