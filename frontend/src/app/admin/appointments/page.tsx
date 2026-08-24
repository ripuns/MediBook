"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Calendar, Clock, Loader2, Sparkles } from 'lucide-react';

type AppointmentRow = {
  id: string;
  status: string;
  slotStart: string;
  slotEnd: string;
  patient?: { name: string; email: string };
  doctor?: { user?: { name: string; email: string } };
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'COMPLETED':
      return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-100';
  }
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/admin/appointments');
        setAppointments(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        console.warn('Failed to load admin appointments', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const clean = name.replace(/^(Dr\.|Dr)\s+/i, '');
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Appointments Registry</h1>
          <p className="text-sm text-slate-500">Track and filter patient booking records, schedule times, and active consult status.</p>
        </div>

        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {loading ? 'Analyzing…' : `${appointments.length} Records`}
        </span>
      </div>

      {/* Table grid */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-slate-300 transition-all">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 font-bold">Patient Details</th>
                <th className="px-6 py-4 font-bold">Doctor Assigned</th>
                <th className="px-6 py-4 font-bold">Scheduled Time</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>Syncing appointments ledger…</span>
                    </div>
                  </td>
                </tr>
              ) : appointments.length ? (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(appointment.patient?.name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">
                            {appointment.patient?.name ?? 'Patient Record'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 select-all">{appointment.patient?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(appointment.doctor?.user?.name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">
                            {appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Doctor Assigned'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 select-all">{appointment.doctor?.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {new Date(appointment.slotStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <Clock className="w-3.5 h-3.5 text-indigo-500 ml-1" />
                        <span>
                          {new Date(appointment.slotStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-bold text-slate-700 text-sm">No appointment records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Booking logs will automatically populate when patients schedule holds.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
