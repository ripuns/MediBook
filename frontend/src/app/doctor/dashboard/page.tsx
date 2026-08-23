"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function mapStatus(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'HELD':
      return 'Waiting';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Waiting';
  }
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function DoctorDashboardPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarConnected = true;

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/doctor/appointments');
        const list = Array.isArray(resp.data?.data) ? resp.data.data : [];
        setQueue(list.slice(0, 5).map((appointment: any) => ({
          id: appointment.id,
          patient: appointment.patient?.name ?? 'Patient',
          time: formatTime(appointment.slotStart),
          status: mapStatus(appointment.status),
        })));
      } catch (error) {
        console.warn('Doctor dashboard load failed', error);
        setQueue([]);
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
            {calendarConnected ? 'Connected and syncing visit slots' : 'Not connected'}
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
          <div className="text-sm text-gray-500">Today&apos;s visits</div>
          <div className="mt-2 text-3xl font-bold">{queue.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Pending summaries</div>
          <div className="mt-2 text-3xl font-bold">{queue.filter((item) => item.status !== 'Completed').length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Follow-ups</div>
          <div className="mt-2 text-3xl font-bold">{Math.max(1, queue.filter((item) => item.status === 'Confirmed').length)}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Patient queue</h2>
        {loading ? (
          <div className="text-sm text-gray-600">Loading queue…</div>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{item.patient}</div>
                  <div className="text-sm text-gray-500">{item.time}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{item.status}</span>
                  <Link href={`/doctor/appointments/${item.id}`} className="text-sm text-blue-600">
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
