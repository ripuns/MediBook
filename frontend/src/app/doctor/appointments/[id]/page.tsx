"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PreVisitSummaryBadge from '@/components/appointments/PreVisitSummaryBadge';
import api from '@/lib/api';

export default function DoctorAppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/doctor/appointments');
        const list = Array.isArray(response.data?.data) ? response.data.data : [];
        setAppointment(list.find((item: any) => item.id === params.id) ?? null);
      } catch (error) {
        console.warn('Failed to load appointment', error);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.post(`/doctor/appointments/${params.id}/complete`, {
        notes,
        postVisitSummary: appointment?.postVisitSummary ?? null,
        prescription: prescription
          ? [{ drug: prescription, frequency: 'as directed', durationDays: 7 }]
          : [],
      });
      setMessage('Visit saved and marked complete.');
      router.refresh();
    } catch (error) {
      console.warn('Failed to save visit notes', error);
      setMessage('Could not save the visit note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow-sm">Loading appointment…</div>;
  }

  if (!appointment) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow-sm">Appointment not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-blue-700">Appointment</div>
            <h2 className="mt-2 text-2xl font-semibold">{appointment.patient?.name ?? 'Patient'}</h2>
          </div>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">{appointment.status}</span>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
          <div><span className="font-medium text-gray-800">Date:</span> {new Date(appointment.slotStart).toLocaleDateString()}</div>
          <div><span className="font-medium text-gray-800">Time:</span> {new Date(appointment.slotStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
          <div><span className="font-medium text-gray-800">ID:</span> {params.id}</div>
        </div>

        {appointment.symptoms ? (
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm">
            <span className="font-medium text-gray-800">Symptoms:</span> {appointment.symptoms}
          </div>
        ) : null}
      </div>

      <PreVisitSummaryBadge summary={appointment.preVisitSummary ?? 'No AI summary available yet.'} />

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
          <label className="mb-1 block text-sm font-medium">Prescription / follow-up note</label>
          <textarea
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            rows={3}
            className="w-full rounded border px-3 py-2"
            placeholder="Summarise medication or follow-up plan"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">{message ?? 'Use this form to complete the visit.'}</div>
          <button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save visit notes'}
          </button>
        </div>
      </form>
    </div>
  );
}
