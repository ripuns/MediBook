"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SlotPicker from '@/components/booking/SlotPicker';
import SymptomForm from '@/components/booking/SymptomForm';
import { 
  Stethoscope, 
  Calendar, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

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
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const selectedDateLabel = useMemo(() => {
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.getTime())
      ? date
      : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
  }, [date]);

  useEffect(() => {
    async function loadDoctor() {
      try {
        const resp = await api.get(`/patient/doctors/${doctorId}`);
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
      setErrorDetails(null);

      try {
        const resp = await api.get(`/patient/doctors/${doctorId}/slots`, { params: { date } });
        const nextSlots = Array.isArray(resp.data?.data?.slots) ? resp.data.data.slots : [];
        setSlots(nextSlots);
        setSelectedSlot((current) => (current && nextSlots.includes(current) ? current : nextSlots[0] ?? ''));
      } catch (error) {
        console.warn('Failed to load slots', error);
        setSlots([]);
        setSelectedSlot('');
        setErrorDetails('Unable to load availability for this date.');
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
    setErrorDetails(null);

    try {
      const slotStart = selectedSlot;
      const slotEnd = new Date(new Date(slotStart).getTime() + 30 * 60 * 1000).toISOString();

      // Step 1: Hold the slot
      const holdResponse = await api.post('/patient/appointments/hold', {
        doctorId,
        slotStart,
        slotEnd,
      });

      const heldAppointment = holdResponse.data?.data;
      
      // Step 2: Confirm appointment with pre-visit symptoms
      const confirmed = await api.put(`/patient/appointments/${heldAppointment.id}/confirm`, {
        appointmentId: heldAppointment.id,
        symptoms: form.symptoms,
        preVisitSummary: {
          chiefComplaint: form.symptoms.slice(0, 100),
          urgencyLevel: 'Medium',
          suggestedQuestions: [form.notes || 'Any other concerns?'],
        },
      });

      setAppointmentId(confirmed.data?.data?.id ?? heldAppointment.id);
      setMessage('Booking confirmed successfully! Redirecting to appointments…');

      window.setTimeout(() => {
        router.push('/patient/appointments');
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.warn('Failed to confirm booking', error);
      setErrorDetails(error?.response?.data?.message ?? 'Could not complete the booking. The slot may have been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/patient/doctors" 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clinicians</span>
        </Link>
      </div>

      {/* Grid wrapper */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        
        {/* Left Column: Doctor Profile & Date Select */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              Selected Provider
            </span>
            {loadingDoctor ? (
              <div className="flex items-center gap-2 py-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Loading clinician profile…</span>
              </div>
            ) : doctor ? (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">
                  {doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}
                </h2>
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {doctor.specialisation || 'General Practice'}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  {doctor.bio || 'Dedicated clinical provider focused on preventative healthcare and comprehensive management plans.'}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Booking for: <strong className="text-slate-700 font-semibold">{selectedDateLabel}</strong></span>
                </div>
              </div>
            ) : (
              <div className="text-slate-600 text-sm">Clinician profile could not be loaded.</div>
            )}
          </div>

          {/* Date Picker Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5 hover:border-slate-300 transition-all">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Appointment Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Slot Picker & Symptom Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-all">
            <SlotPicker 
              selectedSlot={selectedSlot} 
              onSelect={setSelectedSlot} 
              slots={slots} 
              loading={loadingSlots} 
            />
          </div>

          <SymptomForm
            form={form}
            onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
            onSubmit={handleConfirm}
          />

          {submitting && (
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Securing your slot and building pre-visit files…</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm animate-pulse">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="leading-normal flex-1">
                {message}
                {appointmentId && (
                  <span className="block mt-1 font-semibold text-emerald-600">
                    Visit ID: #{appointmentId.slice(0, 8)}
                  </span>
                )}
              </div>
            </div>
          )}

          {errorDetails && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="leading-normal">{errorDetails}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
