"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Calendar, 
  Users, 
  Heart, 
  CheckCircle2, 
  AlertTriangle, 
  CalendarPlus, 
  ArrowRight,
  Loader2,
  Clock
} from 'lucide-react';

const defaultUpcoming: any[] = [];

function mapStatus(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return { text: 'Confirmed', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    case 'HELD':
      return { text: 'Pending Hold', classes: 'bg-amber-50 text-amber-700 border-amber-100' };
    case 'CANCELLED':
      return { text: 'Cancelled', classes: 'bg-rose-50 text-rose-700 border-rose-100' };
    case 'COMPLETED':
      return { text: 'Completed', classes: 'bg-slate-50 text-slate-700 border-slate-100' };
    default:
      return { text: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-100' };
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function PatientDashboardPage() {
  const [upcoming, setUpcoming] = useState<any[]>(defaultUpcoming);
  const [doctorCount, setDoctorCount] = useState(0);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarNotice, setCalendarNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'connected') {
      setCalendarNotice('Google Calendar connected successfully. Your appointments will sync automatically.');
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [appointmentsRes, doctorsRes, calendarRes] = await Promise.all([
          api.get('/patient/appointments').catch(() => ({ data: { data: [] } })),
          api.get('/patient/doctors').catch(() => ({ data: { data: [] } })),
          api.get('/calendar/status').catch(() => ({ data: { data: { connected: false } } })),
        ]);

        const appointments = Array.isArray(appointmentsRes.data?.data) ? appointmentsRes.data.data : [];
        const doctors = Array.isArray(doctorsRes.data?.data) ? doctorsRes.data.data : [];

        setDoctorCount(doctors.length);
        setCalendarConnected(Boolean(calendarRes.data?.data?.connected));
        
        // Filter out completed/cancelled to display active upcoming ones primarily
        const activeAppointments = appointments.filter(
          (apt: any) => apt.status === 'CONFIRMED' || apt.status === 'HELD'
        );
        
        setUpcoming(
          activeAppointments.slice(0, 3).map((appointment: any) => ({
            id: appointment.id,
            doctor: appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Clinic Doctor',
            specialty: appointment.doctor?.specialisation ?? 'Specialist',
            date: formatDateTime(appointment.slotStart),
            status: mapStatus(appointment.status),
          }))
        );
      } catch (error) {
        console.warn('Patient dashboard load failed', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleConnectCalendar = async () => {
    setCalendarLoading(true);
    try {
      const response = await api.get('/calendar/connect');
      const url = response.data?.data?.url;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.warn('Calendar connect failed', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome banner */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Patient Dashboard</h1>
        <p className="text-sm text-slate-500">Manage calendar synchronisation and booking records.</p>
      </div>

      {calendarNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{calendarNotice}</div>
        </div>
      )}

      {/* Google Calendar Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-6 md:flex-row md:items-center md:justify-between transition-all hover:border-slate-300">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${calendarConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {calendarConnected ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Google Calendar Integration</h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Sync your schedule to secure clinic holds and write confirmed visits directly to your calendar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
            calendarConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {calendarConnected ? 'Synced & Active' : 'Disconnected'}
          </span>
          
          <button
            type="button"
            onClick={handleConnectCalendar}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all ${
              calendarConnected 
                ? 'bg-slate-700 hover:bg-slate-800 shadow-slate-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            } disabled:opacity-60`}
            disabled={calendarLoading}
          >
            {calendarLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting…</span>
              </>
            ) : calendarConnected ? (
              'Reconnect Calendar'
            ) : (
              'Connect Google Calendar'
            )}
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Upcoming Visits</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{loading ? '…' : upcoming.length}</div>
          <div className="text-xs text-slate-400">Confirmed clinic consultations</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Doctors</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{loading ? '…' : doctorCount}</div>
          <div className="text-xs text-slate-400">Providers in active practice</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Care Reminders</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{loading ? '…' : Math.max(0, upcoming.length)}</div>
          <div className="text-xs text-slate-400">Adhering medication reminders</div>
        </div>
      </div>

      {/* Upcoming appointments list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">Your Upcoming Consultations</h2>
            <p className="text-xs text-slate-400">Click on "My Visits" in the sidebar to review all past items.</p>
          </div>
          <Link 
            href="/patient/doctors" 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 hover:text-indigo-800 transition-all"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Book A Doctor</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center text-slate-500 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Loading appointments…</span>
          </div>
        ) : upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((appt) => (
              <div 
                key={appt.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200/80 p-4 hover:border-slate-300 transition-all gap-4 bg-gradient-to-r from-slate-50/50 to-white"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-indigo-50/70 text-indigo-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{appt.doctor}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{appt.specialty}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{appt.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${appt.status.classes}`}>
                    {appt.status.text}
                  </span>
                  
                  <Link 
                    href="/patient/appointments" 
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-700 text-sm">No upcoming appointments</p>
              <p className="text-xs text-slate-400">Discover clinicians and secure a consultation slot.</p>
            </div>
            <Link 
              href="/patient/doctors" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition-all"
            >
              <span>Find a Doctor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
