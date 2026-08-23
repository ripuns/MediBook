"use client";

import React, { useState } from 'react';
import PreVisitSummaryBadge from '@/components/appointments/PreVisitSummaryBadge';

const appointment = {
  id: 'apt-1001',
  patientName: 'Riya Sharma',
  time: '09:30 AM',
  date: 'Tue, 26 Aug 2026',
  reason: 'Follow-up for recurring migraines',
  summary: 'Patient reports worsening headaches after caffeine and poor sleep. Requests medication review and guidance on preventive care.',
};

export default function DoctorAppointmentDetailPage({ params }: { params: { id: string } }) {
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Visit notes saved for ${appointment.patientName}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-blue-700">Appointment</div>
            <h2 className="mt-2 text-2xl font-semibold">{appointment.patientName}</h2>
          </div>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">Waiting</span>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
          <div><span className="font-medium text-gray-800">Date:</span> {appointment.date}</div>
          <div><span className="font-medium text-gray-800">Time:</span> {appointment.time}</div>
          <div><span className="font-medium text-gray-800">ID:</span> {params.id}</div>
        </div>

        <div className="mt-4 rounded bg-gray-50 p-3 text-sm">
          <span className="font-medium text-gray-800">Reason for visit:</span> {appointment.reason}
        </div>
      </div>

      <PreVisitSummaryBadge summary={appointment.summary} />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Post-visit documentation</h3>

        <div>
          <label className="mb-1 block text-sm font-medium">Clinician notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full rounded border px-3 py-2"
            placeholder="Document findings, diagnosis, and treatment plan"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Prescription / follow-up</label>
          <textarea
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            rows={3}
            className="w-full rounded border px-3 py-2"
            placeholder="Prescribe medication, order labs, or set follow-up plan"
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Save visit notes
          </button>
        </div>
      </form>
    </div>
  );
}
