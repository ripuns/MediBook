"use client";

import { useEffect, useState } from 'react';
import AppointmentCard, { type Appointment } from '@/components/appointments/AppointmentCard';
import api from '@/lib/api';
import { Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

function mapAppointmentStatus(status: string): Appointment['status'] {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'HELD':
      return 'Pending';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

function getDisplayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) 
    ? value 
    : new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function getDisplayTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) 
    ? value 
    : new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/patient/appointments');
        const list = Array.isArray(resp.data?.data) ? resp.data.data : [];
        setAppointments(list.map((appointment: any) => ({
          id: appointment.id,
          doctorName: appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Clinic Doctor',
          specialty: appointment.doctor?.specialisation ?? 'Specialist',
          date: getDisplayDate(appointment.slotStart),
          time: getDisplayTime(appointment.slotStart),
          location: 'Main Medical Clinic Room 3B',
          status: mapAppointmentStatus(appointment.status),
        })));
      } catch (error) {
        console.warn('Failed to load patient appointments', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.put(`/patient/appointments/${id}/cancel`, { appointmentId: id });
      setAppointments((current) => 
        current.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' as const } : apt))
      );
    } catch (error) {
      console.warn('Failed to cancel appointment', error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">My Consultations</h1>
          <p className="text-sm text-slate-500">Track current clinic slot holds and confirmed appointment details.</p>
        </div>
        
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {loading ? 'Analyzing…' : `${appointments.length} Total Visits`}
        </span>
      </div>

      {/* Appointment listing */}
      {loading ? (
        <div className="py-16 flex items-center justify-center text-slate-500 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Syncing consultations…</span>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              onCancel={handleCancel} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-200 bg-white rounded-2xl space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-700 text-sm">No appointments found</p>
            <p className="text-xs text-slate-400">You haven&apos;t scheduled any consultations yet.</p>
          </div>
          <div className="pt-2">
            <Link 
              href="/patient/doctors" 
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md transition-all text-xs"
            >
              Discover Providers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
