"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Bell, AlertCircle, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';

type NotificationRow = {
  id: string;
  type: string;
  channel: string;
  status: string;
  attempts: number;
  lastError?: string | null;
  updatedAt: string;
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'SENT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'GAVE_UP':
      return 'bg-slate-100 text-slate-600 border-slate-350';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/admin/notifications');
        setNotifications(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        console.warn('Failed to load admin notifications', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const gaveUpCount = notifications.filter((item) => item.status === 'GAVE_UP').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Notification logs</h1>
          <p className="text-sm text-slate-500">Monitor dispatch statuses, email delivery, and Google API synchronization logs.</p>
        </div>

        {gaveUpCount > 0 ? (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{gaveUpCount} Delivery Failures</span>
          </span>
        ) : (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {loading ? 'Analyzing…' : `${notifications.length} Logs`}
          </span>
        )}
      </div>

      {/* Table listing */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-slate-300 transition-all">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 font-bold">Event Type</th>
                <th className="px-6 py-4 font-bold">Delivery Channel</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Retries</th>
                <th className="px-6 py-4 font-bold">Trace Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>Syncing message queues…</span>
                    </div>
                  </td>
                </tr>
              ) : notifications.length ? (
                notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {notification.type}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500 text-xs">
                      {notification.channel}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getStatusBadgeClass(notification.status)}`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {notification.attempts} / 5
                    </td>
                    <td className="px-6 py-4">
                      {notification.lastError ? (
                        <div className="max-w-xs text-xs font-mono bg-rose-50 text-rose-700 px-2.5 py-1.5 rounded-lg border border-rose-100 overflow-x-auto select-all leading-normal whitespace-pre-wrap">
                          {notification.lastError}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-455">
                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No notification logs recorded</p>
                    <p className="text-xs text-slate-400 mt-0.5">Logs are automatically created when notification alerts dispatch.</p>
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
