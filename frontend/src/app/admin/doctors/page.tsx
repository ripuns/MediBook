"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

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
        setDoctors(list.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name ?? doctor.user?.name ?? 'Doctor',
          specialisation: doctor.specialisation ?? 'General practice',
          bio: doctor.bio ?? '',
          status: doctor.bio ? 'Available' : 'Busy',
        })));
      } catch (error) {
        console.warn('Failed to load doctors', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Doctors</h2>
        <Link href="/admin/doctors/new" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Add Doctor
        </Link>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Speciality</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-gray-500">Loading doctors…</td>
                </tr>
              ) : doctors.length ? (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-xs text-gray-500">{doctor.id}</div>
                    </td>
                    <td className="px-4 py-3">{doctor.specialisation}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                        <Link href={`/admin/doctors/${doctor.id}`} className="text-blue-600">
                          View
                        </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-gray-500">No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
