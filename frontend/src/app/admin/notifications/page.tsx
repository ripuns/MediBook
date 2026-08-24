"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

type NotificationRow = {
  id: string;
  type: string;
  channel: string;
  status: string;
  attempts: number;
  lastError?: string | null;
  updatedAt: string;
};

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
          {loading ? 'Loading…' : `${notifications.filter((item) => item.status === 'GAVE_UP').length} gave up`}
        </span>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Attempts</th>
                <th className="px-4 py-3 font-medium">Last Error</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-gray-500">Loading notifications…</td>
                </tr>
              ) : notifications.length ? (
                notifications.map((notification) => (
                  <tr key={notification.id} className="border-t">
                    <td className="px-4 py-3">{notification.type}</td>
                    <td className="px-4 py-3">{notification.channel}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{notification.attempts}</td>
                    <td className="px-4 py-3 text-gray-600">{notification.lastError ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-gray-500">No notifications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
