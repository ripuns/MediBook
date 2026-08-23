"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const emptyForm = {
  specialisation: 'Cardiology',
  slotDurationMin: 30,
  bio: '',
};

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/doctor/${params.id}`);
        const nextDoctor = response.data?.data ?? null;
        setDoctor(nextDoctor);
        setForm({
          specialisation: nextDoctor?.specialisation ?? 'Cardiology',
          slotDurationMin: nextDoctor?.slotDurationMin ?? 30,
          bio: nextDoctor?.bio ?? '',
        });
      } catch (error) {
        console.warn('Failed to load doctor profile', error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await api.put(`/admin/doctors/${params.id}`, {
        specialisation: form.specialisation,
        slotDurationMin: form.slotDurationMin,
        bio: form.bio || null,
      });

      setDoctor(response.data?.data ?? doctor);
      setMessage('Doctor profile updated.');
    } catch (error) {
      console.warn('Failed to update doctor', error);
      setMessage('Could not update this doctor.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.post(`/admin/doctors/${params.id}/leave`, {
        date: leaveDate,
        reason: leaveReason || null,
      });
      setMessage('Leave day added.');
      setLeaveDate('');
      setLeaveReason('');
    } catch (error) {
      console.warn('Failed to add leave day', error);
      setMessage('Could not create the leave day.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await api.delete(`/admin/doctors/${params.id}`);
      setMessage('Doctor deleted.');
    } catch (error) {
      console.warn('Failed to delete doctor', error);
      setMessage('Could not delete this doctor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow-sm">Loading doctor profile…</div>;
  }

  if (!doctor) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow-sm">Doctor not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{doctor.name}</h2>
            <div className="text-sm text-gray-600">{doctor.specialisation}</div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">Active</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div>{doctor.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Bio</div>
            <div>{doctor.bio || 'No bio provided yet.'}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Edit profile</h3>
          <Link href="/admin/doctors" className="text-sm text-blue-600">Back to list</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Speciality</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.specialisation}
              onChange={(e) => setForm((current) => ({ ...current, specialisation: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slot duration</label>
            <input
              type="number"
              min={15}
              step={15}
              className="w-full rounded border px-3 py-2"
              value={form.slotDurationMin}
              onChange={(e) => setForm((current) => ({ ...current, slotDurationMin: Number(e.target.value) }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <textarea
              rows={4}
              className="w-full rounded border px-3 py-2"
              value={form.bio}
              onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">{message ?? 'Changes save directly to the live profile.'}</div>
          <button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handleCreateLeave} className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Add leave day</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Leave date</label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reason</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">This will cancel any confirmed appointments on that date.</div>
          <button type="submit" disabled={saving} className="rounded bg-amber-600 px-4 py-2 text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Add leave'}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-red-800">Danger zone</h3>
        <p className="mt-2 text-sm text-red-700">
          Deleting the doctor removes the profile. The user account is kept separate for now.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {saving ? 'Working…' : 'Delete doctor'}
        </button>
      </div>
    </div>
  );
}
