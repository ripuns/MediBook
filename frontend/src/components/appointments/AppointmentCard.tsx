"use client";

import React from 'react';
import { Calendar, Clock, MapPin, AlertCircle, XCircle } from 'lucide-react';

export type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
};

export default function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel?: (id: string) => void;
}) {
  const statusClasses = {
    Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Completed: 'bg-sky-50 text-sky-700 border-sky-200',
    Cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
  }[appointment.status];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/30 transition-all duration-200 flex flex-col justify-between gap-6">
      
      {/* Top Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800 leading-tight">
            {appointment.doctorName?.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`}
          </h3>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {appointment.specialty}
          </div>
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${statusClasses}`}>
          {appointment.status}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-slate-100">
        <div className="flex items-start gap-2.5 text-xs">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Date</span>
            <span className="font-semibold text-slate-700">{appointment.date}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Time</span>
            <span className="font-semibold text-slate-700">{appointment.time}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs">
          <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Location</span>
            <span className="font-semibold text-slate-700">{appointment.location}</span>
          </div>
        </div>
      </div>

      {/* Footer / Cancel Button */}
      {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Hold time expires shortly if not confirmed.</span>
          </div>

          <button
            type="button"
            onClick={() => onCancel?.(appointment.id)}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 px-4 py-2 text-xs font-bold transition-all duration-200"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Appointment</span>
          </button>
        </div>
      )}
    </div>
  );
}
