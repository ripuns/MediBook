"use client";

import React from 'react';
import { CalendarCheck, ShieldCheck } from 'lucide-react';

export default function SymptomForm({
  form,
  onChange,
  onSubmit,
}: {
  form: { symptoms: string; notes: string };
  onChange: (field: keyof typeof form, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800">Appointment Details</h3>
        <p className="text-xs text-slate-500">Provide pre-visit symptoms to help the clinician prepare for your consultation.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Primary Symptoms / Reason for Visit
          </label>
          <textarea
            value={form.symptoms}
            onChange={(e) => onChange('symptoms', e.target.value)}
            rows={4}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
            placeholder="Please detail your symptoms, duration, and pain levels (e.g. 'Consistent tension headaches over the last three days...')"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Relevant Medical History / Additional Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={3}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
            placeholder="Any current medications, allergies, or prior treatments the doctor should review"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Google Calendar hold will confirm instantly</span>
        </div>

        <button 
          type="submit" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Confirm Booking</span>
        </button>
      </div>
    </form>
  );
}
