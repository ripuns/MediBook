"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type Overview = {
  userCount: number;
  doctorCount: number;
  patientCount: number;
  appointmentCount: number;
  pendingHoldCount: number;
};

const defaultOverview: Overview = {
  userCount: 0,
  doctorCount: 0,
  patientCount: 0,
  appointmentCount: 0,
  pendingHoldCount: 0,
};

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview>(defaultOverview);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/admin/overview');
        setOverview(response.data?.data ?? defaultOverview);
      } catch (error) {
        console.warn('Failed to load admin overview', error);
        setOverview(defaultOverview);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = [
    { label: 'Total Patients', value: loading ? '…' : String(overview.patientCount), detail: 'Registered patient accounts' },
    { label: 'Active Doctors', value: loading ? '…' : String(overview.doctorCount), detail: 'Linked clinician profiles' },
    { label: 'Appointments', value: loading ? '…' : String(overview.appointmentCount), detail: 'All booking records' },
    { label: 'Pending Holds', value: loading ? '…' : String(overview.pendingHoldCount), detail: 'Temporary reservations' },
  ];

  const recentActions = [
    'Monitor expired holds and booking spikes from the live counters.',
    'Review doctor profiles and leave patterns before clinic hours.',
    'Use the doctor list to keep profiles and specialisations current.',
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="mt-2 text-3xl font-bold">{stat.value}</div>
            <div className="mt-1 text-xs text-green-600">{stat.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Operational Overview</h2>
            <Link href="/admin/doctors" className="text-sm text-blue-600">View doctors</Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm text-gray-600">User base</div>
              <div className="h-2 w-full rounded bg-gray-200">
                <div className="h-2 w-[72%] rounded bg-blue-600" />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm text-gray-600">Live holds</div>
              <div className="h-2 w-full rounded bg-gray-200">
                <div className="h-2 w-[14%] rounded bg-amber-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm text-gray-600">Appointments processed</div>
              <div className="h-2 w-full rounded bg-gray-200">
                <div className="h-2 w-[86%] rounded bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            {recentActions.map((item) => (
              <li key={item} className="border-b pb-2 last:border-0 last:pb-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
