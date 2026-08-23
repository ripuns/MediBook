"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const defaultUpcoming = [
  { doctor: 'No upcoming appointments', date: 'Connect a doctor to get started', status: 'Pending' },
];

function mapStatus(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'HELD':
      return 'Pending';
    case 'CANCELLED':
      return 'Cancelled';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'Pending';
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function PatientDashboardPage() {
  const [upcoming, setUpcoming] = useState(defaultUpcoming);
  const [doctorCount, setDoctorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const calendarConnected = true;

  useEffect(() => {
    async function load() {
      try {
        const [appointmentsRes, doctorsRes] = await Promise.all([
          api.get('/patient/appointments').catch(() => ({ data: { data: [] } })),
          api.get('/doctor/directory').catch(() => ({ data: { data: [] } })),
        ]);

        const appointments = Array.isArray(appointmentsRes.data?.data) ? appointmentsRes.data.data : [];
        const doctors = Array.isArray(doctorsRes.data?.data) ? doctorsRes.data.data : [];

        setDoctorCount(doctors.length);
        setUpcoming(
          appointments.slice(0, 2).map((appointment: any) => ({
            doctor: appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Doctor visit',
            date: formatDateTime(appointment.slotStart),
            status: mapStatus(appointment.status),
          })),
        );
      } catch (error) {
        console.warn('Patient dashboard load failed', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Google Calendar</h2>
          <div className="text-sm text-gray-600">
            {calendarConnected ? 'Connected and syncing appointments' : 'Not connected'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${calendarConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
            {calendarConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button type="button" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            {calendarConnected ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Upcoming visits</div>
          <div className="mt-2 text-3xl font-bold">{loading ? '…' : upcoming.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Available doctors</div>
          <div className="mt-2 text-3xl font-bold">{doctorCount}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Care reminders</div>
          <div className="mt-2 text-3xl font-bold">{Math.max(1, Math.min(4, upcoming.length + 1))}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming appointments</h2>
          <Link href="/patient/doctors" className="text-sm text-blue-600">Find a doctor</Link>
        </div>

        <div className="space-y-3">
          {upcoming.map((appt) => (
            <div key={`${appt.doctor}-${appt.date}`} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{appt.doctor}</div>
                <div className="text-sm text-gray-500">{appt.date}</div>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : appt.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
