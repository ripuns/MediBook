"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/doctor/${params.id}`);
        setDoctor(response.data?.data ?? null);
      } catch (error) {
        console.warn('Failed to load doctor profile', error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  if (loading) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow-sm">Loading doctor profile…</div>;
  }

  if (!doctor) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow-sm">Doctor not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{doctor.name}</h2>
            <div className="text-sm text-gray-600">{doctor.specialisation}</div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">Active</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div>{doctor.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Bio</div>
            <div>{doctor.bio || 'No bio provided yet.'}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Profile controls</h3>
          <Link href="/admin/doctors" className="text-sm text-blue-600">Back to list</Link>
        </div>
        <div className="text-sm text-gray-600">
          Doctor create/edit actions are still pending backend routes. This page now reflects live data and is ready for those mutations once the API is added.
        </div>
      </div>
    </div>
  );
}
