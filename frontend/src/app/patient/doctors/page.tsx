"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

export default function PatientDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/doctor/directory');
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
    return doctors.filter((doc) => `${doc.name ?? ''} ${doc.specialisation ?? ''} ${doc.bio ?? ''}`.toLowerCase().includes(q));
  }, [doctors, query]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Find a doctor</h2>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by doctor, specialty, or clinic"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {loading ? (
        <div className="rounded-lg border bg-white p-5 text-sm text-gray-600 shadow-sm">Loading doctors…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{doctor.name}</h3>
                  <div className="text-sm text-gray-600">{doctor.specialisation}</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Available</span>
              </div>

              <div className="mt-3 text-sm text-gray-600">{doctor.bio || 'Care team member'}</div>
              <div className="mt-2 text-sm font-medium text-blue-700">Next available: Today or next scheduled slot</div>

              <div className="mt-4">
                <Link href={`/patient/book/${doctor.id}`} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  Book visit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
