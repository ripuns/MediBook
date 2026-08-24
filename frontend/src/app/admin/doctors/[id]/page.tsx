"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Save, 
  Trash2, 
  PlusCircle, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';

const emptyForm = {
  specialisation: 'Cardiology',
  slotDurationMin: 30,
  bio: '',
};

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [doctor, setDoctor] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/admin/doctors/${id}`);
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
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await api.put(`/admin/doctors/${id}`, {
        specialisation: form.specialisation,
        slotDurationMin: form.slotDurationMin,
        bio: form.bio || null,
      });

      setDoctor(response.data?.data ?? doctor);
      setMessage('Doctor profile updated successfully.');
    } catch (error: any) {
      console.warn('Failed to update doctor', error);
      setErrorMessage(error?.response?.data?.message ?? 'Could not update this doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await api.post(`/admin/doctors/${id}/leave`, {
        date: leaveDate,
        reason: leaveReason || null,
      });
      setMessage('Leave day successfully added to doctor profile.');
      setLeaveDate('');
      setLeaveReason('');
      
      // Reload profile to refresh leaves history list
      const response = await api.get(`/admin/doctors/${id}`);
      setDoctor(response.data?.data ?? doctor);
    } catch (error: any) {
      console.warn('Failed to add leave day', error);
      setErrorMessage(error?.response?.data?.message ?? 'Could not add the leave day.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this doctor? This action is permanent.")) return;
    
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await api.delete(`/admin/doctors/${id}`);
      setMessage('Doctor successfully removed from clinic registry.');
    } catch (error: any) {
      console.warn('Failed to delete doctor', error);
      setErrorMessage(error?.response?.data?.message ?? 'Could not delete this doctor.');
    } finally {
      setSaving(false);
    }
  };

  const getDoctorInitials = (name?: string) => {
    if (!name) return 'Dr';
    const clean = name.replace(/^(Dr\.|Dr)\s+/i, '');
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-sm gap-2 max-w-4xl mx-auto">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span>Loading provider profile…</span>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="font-bold">Provider Profile Not Found</p>
        <p className="text-xs text-red-600 mt-1">Please confirm the clinician reference ID exists in the system registry.</p>
        <Link href="/admin/doctors" className="mt-4 inline-block text-xs font-semibold underline text-red-700">
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
          href="/admin/doctors" 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clinicians</span>
        </Link>
      </div>

      {/* Grid layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        
        {/* Left Column: Doctor Profile Detail Summary & Leave History */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              Profile Summary
            </span>

            <div className="flex items-start gap-4 pt-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50 flex items-center justify-center font-bold text-sm tracking-wide shrink-0">
                {getDoctorInitials(doctor.name)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">
                  {doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}
                </h2>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
                  {doctor.specialisation || 'General Practice'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid gap-3 text-xs text-slate-600">
              <div>
                <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
                <span className="font-semibold text-slate-700">{doctor.email || 'No email synced'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Provider Bio</span>
                <p className="text-slate-600 italic leading-relaxed mt-1">
                  {doctor.bio ? `"${doctor.bio}"` : 'No biography added yet.'}
                </p>
              </div>
            </div>
          </div>

          {/* Leave History Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
              Leave Calendar History
            </span>

            {Array.isArray(doctor.leaves) && doctor.leaves.length ? (
              <div className="space-y-3 pt-2 max-h-64 overflow-y-auto pr-1">
                {doctor.leaves.map((leave: any) => (
                  <div key={leave.id} className="rounded-xl border border-slate-150 p-3.5 bg-slate-50/50 flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {new Date(leave.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 italic">
                        {leave.reason || 'Personal / General leave day'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-xs py-4 text-center">
                No leave days registered for this provider.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edit Profile & Leave Booking & Danger Zone */}
        <div className="space-y-6">
          
          {/* Edit Profile Form */}
          <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Modify Profile</h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Direct Update</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Speciality</label>
                <input
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  value={form.specialisation}
                  onChange={(e) => setForm((current) => ({ ...current, specialisation: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Slot duration (min)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-700 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                    value={form.slotDurationMin}
                    onChange={(e) => setForm((current) => ({ ...current, slotDurationMin: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-medium">Bio Description</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  value={form.bio}
                  onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={saving} 
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Updating…' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

          {/* Add Leave Day Form */}
          <form onSubmit={handleCreateLeave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <h3 className="text-lg font-bold text-slate-800">Add Clinic Leave</h3>
            
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Leave Date</label>
                <input
                  type="date"
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  value={leaveDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Reason</label>
                <input
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  placeholder="e.g., Annual conference"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold leading-normal max-w-sm">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Important: This will cancel all existing holds on this date.</span>
              </div>
              
              <button 
                type="submit" 
                disabled={saving} 
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{saving ? 'Adding…' : 'Add Leave'}</span>
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm space-y-4 hover:border-red-300 transition-all">
            <h3 className="text-lg font-bold text-red-800">Danger Zone</h3>
            <p className="text-xs text-red-700 leading-relaxed">
              Deleting this doctor deletes the profile completely. The underlying user record will remain intact, but clinic slots will be cancelled immediately.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{saving ? 'Processing…' : 'Delete Provider'}</span>
              </button>
            </div>
          </div>

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
