"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Activity, 
  Hourglass, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Loader2
} from 'lucide-react';

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
    { 
      label: 'Total Patients', 
      value: loading ? '…' : String(overview.patientCount), 
      detail: 'Registered patient accounts',
      icon: <Users className="w-4 h-4" />,
      color: 'text-indigo-600 bg-indigo-50'
    },
    { 
      label: 'Active Doctors', 
      value: loading ? '…' : String(overview.doctorCount), 
      detail: 'Linked clinician profiles',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'text-emerald-600 bg-emerald-50'
    },
    { 
      label: 'Appointments', 
      value: loading ? '…' : String(overview.appointmentCount), 
      detail: 'All booking records',
      icon: <Calendar className="w-4 h-4" />,
      color: 'text-sky-600 bg-sky-50'
    },
    { 
      label: 'Pending Holds', 
      value: loading ? '…' : String(overview.pendingHoldCount), 
      detail: 'Temporary reservations',
      icon: <Hourglass className="w-4 h-4" />,
      color: 'text-amber-600 bg-amber-50'
    },
  ];

  const recentActions = [
    { text: 'Monitor expired holds and booking spikes from the live counters.', type: 'alert' },
    { text: 'Review doctor profiles and leave patterns before clinic hours.', type: 'info' },
    { text: 'Use the doctor list to keep profiles and specialisations current.', type: 'check' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Clinic Administration</h1>
        <p className="text-sm text-slate-500">Monitor system load statistics, check live reservations, and configure clinicians.</p>
      </div>

      {/* Stats blocks */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stat.value}</div>
            <div className="text-xs text-slate-500 font-medium">{stat.detail}</div>
          </div>
        ))}
      </div>

      {/* Operational Overviews & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        
        {/* Progress bar charts card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Operational System Health</h2>
              <p className="text-xs text-slate-400">Review database constraints, pending hold buffers, and registration loads.</p>
            </div>
            <Link 
              href="/admin/doctors" 
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all"
            >
              <span>Manage Doctors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">User Base Load</span>
                <span className="text-slate-700">{loading ? '…' : `${overview.userCount} Accounts`}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: loading ? '0%' : '72%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Active Calendar Holds</span>
                <span className="text-slate-700">{loading ? '…' : `${overview.pendingHoldCount} Held`}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: loading ? '0%' : '14%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Confirmed Appointments Processed</span>
                <span className="text-slate-700">{loading ? '…' : `${overview.appointmentCount} Visits`}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: loading ? '0%' : '86%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* System Activity checklist card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 hover:border-slate-300 transition-all">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Operational Reminders</h2>
            <p className="text-xs text-slate-400">Regular maintenance updates for clinic admins.</p>
          </div>

          <div className="space-y-4">
            {recentActions.map((item, idx) => (
              <div key={idx} className="flex gap-3.5 p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="mt-0.5 shrink-0">
                  {item.type === 'alert' && <Activity className="w-4.5 h-4.5 text-amber-500" />}
                  {item.type === 'info' && <Info className="w-4.5 h-4.5 text-indigo-500" />}
                  {item.type === 'check' && <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />}
                </div>
                <p className="text-xs font-medium text-slate-600 leading-normal">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
