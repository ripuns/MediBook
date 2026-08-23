"use client";

import { useEffect, useState } from 'react';
import AppointmentCard, { type Appointment } from '@/components/appointments/AppointmentCard';
import api from '@/lib/api';

function mapAppointmentStatus(status: string): Appointment['status'] {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'HELD':
      return 'Pending';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

function getDisplayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function getDisplayTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/patient/appointments');
        const list = Array.isArray(resp.data?.data) ? resp.data.data : [];
        setAppointments(list.map((appointment: any) => ({
          id: appointment.id,
          doctorName: appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Doctor',
          specialty: appointment.doctor?.specialisation ?? 'General care',
          date: getDisplayDate(appointment.slotStart),
          time: getDisplayTime(appointment.slotStart),
          location: 'Clinic schedule',
          status: mapAppointmentStatus(appointment.status),
        })));
      } catch (error) {
        console.warn('Failed to load patient appointments', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.post('/booking/cancel', { appointmentId: id });
      setAppointments((current) => current.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' } : apt)));
    } catch (error) {
      console.warn('Failed to cancel appointment', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My appointments</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {loading ? 'Loading…' : `${appointments.length} total`}
        </span>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-white p-5 text-sm text-gray-600 shadow-sm">Loading appointments…</div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
