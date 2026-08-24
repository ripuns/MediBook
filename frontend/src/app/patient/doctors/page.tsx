"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Search, Stethoscope, ChevronRight, Loader2, Sparkles } from 'lucide-react';

export default function PatientDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/patient/doctors');
        setDoctors(Array.isArray(resp.data?.data) ? resp.data.data : []);
      } catch (error) {
        console.warn('Failed to load doctors', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((doc) => 
      `${doc.name ?? ''} ${doc.specialisation ?? ''} ${doc.bio ?? ''}`.toLowerCase().includes(q)
    );
  }, [doctors, query]);

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
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Find a Clinician</h1>
        <p className="text-sm text-slate-500">Discover doctors, browse clinical specialisations, and book a consultation slot.</p>
      </div>

      {/* Search Bar Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Search Directory
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor, specialisation, bio keywords…"
            className="block w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
          />
        </div>
      </div>

      {/* List results */}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-slate-500 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Searching directory…</span>
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-md hover:shadow-slate-100/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Initials avatar wrapper */}
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50 flex items-center justify-center font-bold text-sm tracking-wide shrink-0">
                      {getDoctorInitials(doctor.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-all">
                        {doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}
                      </h3>
                      <span className="inline-block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
                        {doctor.specialisation || 'General Practice'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                    Online Now
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-500 leading-relaxed italic">
                  {doctor.bio ? `"${doctor.bio}"` : '"Dedicated practitioner focused on compassionate patient outcomes."'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next Available: Today or next scheduled slot</span>
                </div>
              </div>

              <div className="mt-6">
                <Link 
                  href={`/patient/book/${doctor.id}`} 
                  className="w-full flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-100/80 transition-all duration-200"
                >
                  <span>Book Appointment</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-200 bg-white rounded-2xl space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-700 text-sm">No clinicians found</p>
            <p className="text-xs text-slate-400">Try searching for other specialties or double-check spelling.</p>
          </div>
        </div>
      )}
    </div>
  );
}
