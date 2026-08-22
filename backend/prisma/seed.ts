import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

// Seed data is created in a single transaction so the default admin/doctor/patient
// accounts are inserted atomically and cannot be partially created on failure.
const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'Password123';

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@medibook.com' },
    update: {},
    create: {
      email: 'admin@medibook.com',
      passwordHash: await bcrypt.hash(defaultPassword, 12),
      role: Role.ADMIN,
      name: 'MediBook Admin',
    },
  });

  const doctors = await Promise.all(
    [
      {
        email: 'doctor1@medibook.com',
        name: 'Dr. House',
        specialisation: 'Cardiology',
      },
      {
        email: 'doctor2@medibook.com',
        name: 'Dr. Foreman',
        specialisation: 'General Practice',
      },
    ].map(async (doctor) => {
      const user = await prisma.user.upsert({
        where: { email: doctor.email },
        update: {},
        create: {
          email: doctor.email,
          passwordHash: await bcrypt.hash(defaultPassword, 12),
          role: Role.DOCTOR,
          name: doctor.name,
        },
      });

      const profile = await prisma.doctorProfile.upsert({
        where: { userId: user.id },
        update: {
          specialisation: doctor.specialisation,
          workingHours: {
            mon: ['09:00', '17:00'],
            tue: ['09:00', '17:00'],
            wed: ['09:00', '17:00'],
            thu: ['09:00', '17:00'],
            fri: ['09:00', '17:00'],
            sat: null,
            sun: null,
          },
        },
        create: {
          userId: user.id,
          specialisation: doctor.specialisation,
          workingHours: {
            mon: ['09:00', '17:00'],
            tue: ['09:00', '17:00'],
            wed: ['09:00', '17:00'],
            thu: ['09:00', '17:00'],
            fri: ['09:00', '17:00'],
            sat: null,
            sun: null,
          },
        },
      });

      return { user, profile };
    }),
  );

  await Promise.all(
    [
      { email: 'patient1@medibook.com', name: 'Aisha Patel' },
      { email: 'patient2@medibook.com', name: 'Daniel Martins' },
    ].map(async (patient) => {
      await prisma.user.upsert({
        where: { email: patient.email },
        update: {},
        create: {
          email: patient.email,
          passwordHash: await bcrypt.hash(defaultPassword, 12),
          role: Role.PATIENT,
          name: patient.name,
        },
      });
    }),
  );

  console.log('Seeded app users:', {
    adminUser: adminUser.email,
    doctors: doctors.map((doctor) => doctor.user.email),
    patientCount: 2,
  });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
