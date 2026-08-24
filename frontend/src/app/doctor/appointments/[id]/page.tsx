"use client";

import React, { useEffect, useState } from 'react';
import PreVisitSummaryBadge from '@/components/appointments/PreVisitSummaryBadge';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileSpreadsheet, 
  Stethoscope, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

type AppointmentDetail = {
  id: string;
  status: string;
  slotStart: string;
  slotEnd: string;
  symptoms?: string | null;
  preVisitSummary?: unknown;
  patient?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'COMPLETED':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

export default function DoctorAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/doctor/appointments/${id}`);
        setAppointment(response.data?.data ?? null);
      } catch (error) {
        console.warn('Failed to load appointment', error);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await api.post(`/doctor/appointments/${id}/complete`, {
        notes,
        prescription: prescription
          ? [{ drug: prescription, frequency: 'as directed', durationDays: 7 }]
          : [],
      });
      setMessage('Patient visit documentation saved and marked as COMPLETED.');
      
      // Update local status representation
      if (appointment) {
        setAppointment({ ...appointment, status: 'COMPLETED' });
      }
    } catch (error: any) {
      console.warn('Failed to save visit notes', error);
      setErrorMessage(error?.response?.data?.message ?? 'Could not save the visit note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-sm gap-2 max-w-4xl mx-auto">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span>Syncing chart details…</span>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="font-bold">Consultation not found</p>
        <p className="text-xs text-red-600 mt-1">Please confirm the reference ID is correct or contact clinic administrator.</p>
        <Link href="/doctor/appointments" className="mt-4 inline-block text-xs font-semibold underline text-red-700">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/doctor/appointments" 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Schedule</span>
        </Link>
      </div>

      {/* Main split grid layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        
        {/* Left Column: Patient Details, Contact, Symptoms, AI pre-visit badge */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              Patient Context
            </span>
            <div className="flex items-start justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">
                    {appointment.patient?.name ?? 'Patient Record'}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    DOB & Records Active
                  </span>
                </div>
              </div>

              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 uppercase tracking-wider ${getStatusBadgeClass(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            {/* Date/Time details */}
            <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Date</span>
                <span className="font-semibold text-slate-700">
                  {new Date(appointment.slotStart).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Time Slot</span>
                <span className="font-semibold text-slate-700">
                  {new Date(appointment.slotStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Consultation Reference</span>
                <span className="font-mono text-slate-500 select-all">{id}</span>
              </div>
            </div>

            {/* Patient Contacts */}
            {appointment.patient && (
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-medium text-slate-700">{appointment.patient.email}</span>
                </div>
                {appointment.patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-medium text-slate-700">{appointment.patient.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Symptoms details */}
          {appointment.symptoms && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 hover:border-slate-300 transition-all">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                Intake Symptoms
              </span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium pl-0.5 italic pt-2">
                &ldquo;{appointment.symptoms}&rdquo;
              </p>
            </div>
          )}

          {/* AI Pre-visit summary */}
          <PreVisitSummaryBadge 
            summary={
              typeof appointment.preVisitSummary === 'string' 
                ? appointment.preVisitSummary 
                : appointment.preVisitSummary && typeof appointment.preVisitSummary === 'object' && 'chiefComplaint' in appointment.preVisitSummary
                  ? (appointment.preVisitSummary as { chiefComplaint?: string }).chiefComplaint
                  : undefined
            } 
          />
        </div>

        {/* Right Column: Post-visit documentation notes form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-all">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Post-Visit Documentation</h3>
              <p className="text-xs text-slate-500">Record final diagnosis, physical exams findings, treatment summary, and active medication prescriptions.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Clinician Findings & Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  placeholder="Document physical exam, diagnosis summary, active care instructions, and follow-up timelines…"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prescription details
                </label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows={3}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  placeholder="e.g. Amoxicillin 500mg, twice a day for 7 days"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Documentation submits directly to patient dashboard</span>
              </div>

              <button 
                type="submit" 
                disabled={saving || appointment.status === 'COMPLETED'}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all duration-200 disabled:opacity-50 disabled:hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Notes…</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>Complete Visit</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm animate-pulse">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="leading-normal">{message}</div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="leading-normal">{errorMessage}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
