"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type AppointmentRow = {
  id: string;
  status: string;
  slotStart: string;
  slotEnd: string;
  patient?: { name: string; email: string };
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/doctor/appointments');
        setAppointments(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        console.warn('Failed to load doctor appointments', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Appointments</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {loading ? 'Loading…' : `${appointments.length} records`}
        </span>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-gray-500">Loading appointments…</td>
                </tr>
              ) : appointments.length ? (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{appointment.patient?.name ?? 'Patient'}</div>
                      <div className="text-xs text-gray-500">{appointment.patient?.email}</div>
                    </td>
                    <td className="px-4 py-3">{formatDateTime(appointment.slotStart)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/doctor/appointments/${appointment.id}`} className="text-blue-600">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-gray-500">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
