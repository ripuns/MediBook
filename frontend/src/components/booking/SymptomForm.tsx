"use client";

import React from 'react';

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
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Tell us about the visit</h3>

      <div>
        <label className="mb-1 block text-sm font-medium">Symptoms</label>
        <textarea
          value={form.symptoms}
          onChange={(e) => onChange('symptoms', e.target.value)}
          rows={4}
          className="w-full rounded border px-3 py-2"
          placeholder="Describe symptoms or reason for consultation"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Additional notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          className="w-full rounded border px-3 py-2"
          placeholder="Any relevant medical history or concerns"
        />
      </div>

      <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white">
        Confirm booking
      </button>
    </form>
  );
}
