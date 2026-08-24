"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Clock, 
  FileText, 
  Sparkles,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

function mapStatus(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return { text: 'Confirmed', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    case 'HELD':
      return { text: 'Waiting', classes: 'bg-amber-50 text-amber-700 border-amber-100' };
    case 'COMPLETED':
      return { text: 'Completed', classes: 'bg-slate-50 text-slate-700 border-slate-100' };
    case 'CANCELLED':
      return { text: 'Cancelled', classes: 'bg-rose-50 text-rose-700 border-rose-100' };
    default:
      return { text: 'Waiting', classes: 'bg-amber-50 text-amber-700 border-amber-100' };
  }
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function DoctorDashboardPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarNotice, setCalendarNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'connected') {
      setCalendarNotice('Google Calendar connected successfully. Visit slots are synced.');
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [appointmentsRes, calendarRes] = await Promise.all([
          api.get('/doctor/appointments'),
          api.get('/calendar/status').catch(() => ({ data: { data: { connected: false } } })),
        ]);

        const list = Array.isArray(appointmentsRes.data?.data) ? appointmentsRes.data.data : [];
        setCalendarConnected(Boolean(calendarRes.data?.data?.connected));
        
        // Map queue items
        setQueue(
          list.slice(0, 5).map((appointment: any) => ({
            id: appointment.id,
            patient: appointment.patient?.name ?? 'Patient Record',
            time: formatTime(appointment.slotStart),
            status: mapStatus(appointment.status),
          }))
        );
      } catch (error) {
        console.warn('Doctor dashboard load failed', error);
        setQueue([]);
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
      console.warn('Failed to open calendar connect flow', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Clinician Portal</h1>
        <p className="text-sm text-slate-500">Monitor today&apos;s appointments queue, access summaries, and document patient visits.</p>
      </div>

      {calendarNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm animate-fade-in">
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
            <h2 className="text-lg font-bold text-slate-800">Calendar Synchronisation</h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Link your workspace with Google Calendar to automatically block leave times and populate clinical slots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
            calendarConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {calendarConnected ? 'Calendar Linked' : 'Not Configured'}
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
                <span>Opening sync flow…</span>
              </>
            ) : calendarConnected ? (
              'Reconnect Google Calendar'
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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today&apos;s Schedule</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{queue.length}</div>
          <div className="text-xs text-slate-400">Total queued patients</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Summaries</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {queue.filter((item) => item.status.text !== 'Completed').length}
          </div>
          <div className="text-xs text-slate-400">Visits requiring notes</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Follow-ups</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {Math.max(0, queue.filter((item) => item.status.text === 'Confirmed').length)}
          </div>
          <div className="text-xs text-slate-400">Confirmed patients remaining</div>
        </div>
      </div>

      {/* Patient queue card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Today&apos;s Patient Queue</h2>
          <p className="text-xs text-slate-400">Select any patient record to review symptoms, AI pre-visit summaries, and update clinical charts.</p>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center text-slate-500 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Loading clinician workspace queue…</span>
          </div>
        ) : queue.length > 0 ? (
          <div className="grid gap-4">
            {queue.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200/80 p-4 hover:border-slate-300 transition-all gap-4 bg-gradient-to-r from-slate-50/50 to-white"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-indigo-50/70 text-indigo-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.patient}</h4>
                    <p className="text-xs text-slate-500 mt-1">Scheduled Time: <strong className="text-slate-700 font-semibold">{item.time}</strong></p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Reference ID: #{item.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${item.status.classes}`}>
                    {item.status.text}
                  </span>
                  
                  <Link 
                    href={`/doctor/appointments/${item.id}`} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 text-xs font-bold transition-all"
                  >
                    <span>Open Chart</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-700 text-sm">Empty schedule</p>
              <p className="text-xs text-slate-400">There are no patient visits booked for your practice today.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
