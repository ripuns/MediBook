"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, UserPlus, Eye, Loader2, ShieldCheck } from 'lucide-react';

type DoctorRow = {
  id: string;
  name: string;
  specialisation?: string;
  bio?: string | null;
  status: 'Available' | 'Busy' | 'On leave';
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/admin/doctors');
        const list = Array.isArray(response.data?.data) ? response.data.data : [];
        setDoctors(
          list.map((doctor: any) => ({
            id: doctor.id,
            name: doctor.name ?? doctor.user?.name ?? 'Doctor Profile',
            specialisation: doctor.specialisation ?? 'General Practice',
            bio: doctor.bio ?? '',
            status: doctor.bio ? 'Available' : 'Busy',
          }))
        );
      } catch (error) {
        console.warn('Failed to load doctors', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const getDoctorInitials = (name?: string) => {
    if (!name) return 'Dr';
    const clean = name.replace(/^(Dr\.|Dr)\s+/i, '');
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Clinician Profiles</h1>
          <p className="text-sm text-slate-500">Add, edit, or configure specialties and calendar leave days for medical staff.</p>
        </div>
        
        <Link 
          href="/admin/doctors/new" 
          className="self-start sm:self-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-100 transition-all duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Clinician</span>
        </Link>
      </div>

      {/* Grid List / Table layout */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-slate-300 transition-all">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 font-bold">Doctor Profile</th>
                <th className="px-6 py-4 font-bold">Speciality</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>Syncing clinician registry…</span>
                    </div>
                  </td>
                </tr>
              ) : doctors.length ? (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {getDoctorInitials(doctor.name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">
                            {doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1 select-all">{doctor.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {doctor.specialisation}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{doctor.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/doctors/${doctor.id}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No doctors registered</p>
                    <p className="text-xs text-slate-400 mt-0.5">Onboard doctor accounts using the button above.</p>
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
