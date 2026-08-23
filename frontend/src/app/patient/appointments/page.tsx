"use client";

import { useState } from 'react';
import AppointmentCard, { type Appointment } from '@/components/appointments/AppointmentCard';

const initialAppointments: Appointment[] = [
  {
    id: 'apt-1001',
    doctorName: 'Dr. Maya Patel',
    specialty: 'Cardiology',
    date: 'Tue, 26 Aug 2026',
    time: '9:30 AM',
    location: 'Downtown Clinic',
    status: 'Confirmed',
  },
  {
    id: 'apt-1002',
    doctorName: 'Dr. Leo Nguyen',
    specialty: 'Dermatology',
    date: 'Thu, 28 Aug 2026',
    time: '2:00 PM',
    location: 'North Wing',
    status: 'Pending',
  },
  {
    id: 'apt-1003',
    doctorName: 'Dr. Aisha Khan',
    specialty: 'Pediatrics',
    date: 'Mon, 1 Sep 2026',
    time: '11:15 AM',
    location: 'Children Center',
    status: 'Completed',
  },
];

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments);

  const handleCancel = (id: string) => {
    setAppointments((current) =>
      current.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' } : apt)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My appointments</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {appointments.length} total
        </span>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} onCancel={handleCancel} />
        ))}
      </div>
    </div>
  );
}
