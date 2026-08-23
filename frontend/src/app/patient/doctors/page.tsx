"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';

const doctors = [
  { id: 'dr-101', name: 'Dr. Maya Patel', specialty: 'Cardiology', location: 'Downtown Clinic', nextAvailable: 'Today, 4:00 PM' },
  { id: 'dr-102', name: 'Dr. Leo Nguyen', specialty: 'Dermatology', location: 'North Wing', nextAvailable: 'Tomorrow, 10:30 AM' },
  { id: 'dr-103', name: 'Dr. Aisha Khan', specialty: 'Pediatrics', location: 'Children Center', nextAvailable: 'Thu, 9:00 AM' },
  { id: 'dr-104', name: 'Dr. Luis Gomez', specialty: 'Neurology', location: 'Research Campus', nextAvailable: 'Fri, 1:15 PM' },
];

export default function PatientDoctorsPage() {
  const [query, setQuery] = useState('');

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((doc) => `${doc.name} ${doc.specialty} ${doc.location}`.toLowerCase().includes(q));
  }, [query]);

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

      <div className="grid gap-4 md:grid-cols-2">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{doctor.name}</h3>
                <div className="text-sm text-gray-600">{doctor.specialty}</div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Available</span>
            </div>

            <div className="mt-3 text-sm text-gray-600">{doctor.location}</div>
            <div className="mt-2 text-sm font-medium text-blue-700">Next available: {doctor.nextAvailable}</div>

            <div className="mt-4">
              <Link href={`/patient/book/${doctor.id}`} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                Book visit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
