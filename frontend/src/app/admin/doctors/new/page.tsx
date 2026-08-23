"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';

const defaultWorkingHours = {
  mon: ['09:00', '17:00'],
  tue: ['09:00', '17:00'],
  wed: ['09:00', '17:00'],
  thu: ['09:00', '17:00'],
  fri: ['09:00', '17:00'],
  sat: null,
  sun: null,
};

export default function NewDoctorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialisation: 'Cardiology',
    bio: '',
    slotDurationMin: 30,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await api.post('/admin/doctors', {
        name: form.name,
        email: form.email,
        password: form.password,
        specialisation: form.specialisation,
        bio: form.bio || null,
        slotDurationMin: form.slotDurationMin,
        workingHours: defaultWorkingHours,
      });

      setMessage(`Doctor created: ${response.data?.data?.name ?? form.name}`);
      router.push('/admin/doctors');
      router.refresh();
    } catch (error) {
      console.warn('Failed to create doctor', error);
      setMessage('Could not create the doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold">Add New Doctor</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Speciality</label>
          <select
            value={form.specialisation}
            onChange={(e) => setForm({ ...form, specialisation: e.target.value })}
            className="w-full rounded border px-3 py-2"
          >
            <option>Cardiology</option>
            <option>Dermatology</option>
            <option>Pediatrics</option>
            <option>Neurology</option>
            <option>General Practice</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Slot duration (minutes)</label>
          <input
            type="number"
            min={15}
            step={15}
            value={form.slotDurationMin}
            onChange={(e) => setForm({ ...form, slotDurationMin: Number(e.target.value) })}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
          <div className="text-sm text-gray-500">{message ?? 'This creates the user and doctor profile together.'}</div>
          <button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}
