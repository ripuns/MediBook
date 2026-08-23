"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SlotPicker from '@/components/booking/SlotPicker';
import SymptomForm from '@/components/booking/SymptomForm';

type Doctor = {
  id: string;
  name: string;
  specialisation?: string;
  bio?: string | null;
};

export default function BookDoctorPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const router = useRouter();
  const { doctorId } = React.use(params);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [form, setForm] = useState({ symptoms: '', notes: '' });
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedDateLabel = useMemo(() => {
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.getTime())
      ? date
      : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(parsed);
  }, [date]);

  useEffect(() => {
    async function loadDoctor() {
      try {
        const resp = await api.get(`/doctor/${doctorId}`);
        setDoctor(resp.data?.data ?? null);
      } catch (error) {
        console.warn('Failed to load doctor', error);
        setDoctor(null);
      } finally {
        setLoadingDoctor(false);
      }
    }

    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      setMessage(null);

      try {
        const resp = await api.get(`/booking/doctor/${doctorId}/slots`, { params: { date } });
        const nextSlots = Array.isArray(resp.data?.data?.slots) ? resp.data.data.slots : [];
        setSlots(nextSlots);
        setSelectedSlot((current) => (current && nextSlots.includes(current) ? current : nextSlots[0] ?? ''));
      } catch (error) {
        console.warn('Failed to load slots', error);
        setSlots([]);
        setSelectedSlot('');
        setMessage('Unable to load availability for this date.');
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [date, doctorId]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot) {
      setMessage('Select an available slot first.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const slotStart = selectedSlot;
      const slotEnd = new Date(new Date(slotStart).getTime() + 30 * 60 * 1000).toISOString();

      const holdResponse = await api.post('/booking/hold', {
        doctorId: doctorId,
        slotStart,
        slotEnd,
      });

      const heldAppointment = holdResponse.data?.data;
      const confirmed = await api.post('/booking/confirm', {
        appointmentId: heldAppointment.id,
        symptoms: form.symptoms,
        preVisitSummary: {
          chiefComplaint: form.symptoms.slice(0, 100),
          urgencyLevel: 'Medium',
          suggestedQuestions: [form.notes || 'Any other concerns?'],
        },
      });

      setAppointmentId(confirmed.data?.data?.id ?? heldAppointment.id);
      setMessage('Booking confirmed. Redirecting to your appointments.');

      window.setTimeout(() => {
        router.push('/patient/appointments');
        router.refresh();
      }, 900);
    } catch (error) {
      console.warn('Failed to confirm booking', error);
      setMessage('Could not complete the booking. The slot may have been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-wide text-blue-700">Doctor</div>
        {loadingDoctor ? (
          <div className="mt-2 text-sm text-gray-500">Loading doctor…</div>
        ) : (
          <>
            <h2 className="mt-2 text-2xl font-semibold">{doctor?.name ?? 'Doctor not found'}</h2>
            <div className="mt-1 text-gray-600">{doctor?.specialisation ?? 'Specialist'} • {doctor?.bio ?? 'Available for consultation'}</div>
            <div className="mt-2 text-sm text-gray-500">Booking for: {selectedDateLabel}</div>
          </>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">Select date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <SlotPicker selectedSlot={selectedSlot} onSelect={setSelectedSlot} slots={slots} loading={loadingSlots} />
      </div>

      <SymptomForm
        form={form}
        onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
        onSubmit={handleConfirm}
      />

      {message ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          {message}
          {appointmentId ? <span className="ml-2 text-blue-600">#{appointmentId.slice(0, 8)}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
