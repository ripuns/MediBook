"use client";

import React from 'react';

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
    Confirmed: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Completed: 'bg-sky-100 text-sky-700',
    Cancelled: 'bg-red-100 text-red-700',
  }[appointment.status];

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
          <div className="text-sm text-gray-600">{appointment.specialty}</div>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses}`}>
          {appointment.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
        <div>
          <div className="font-medium text-gray-800">Date</div>
          <div>{appointment.date}</div>
        </div>
        <div>
          <div className="font-medium text-gray-800">Time</div>
          <div>{appointment.time}</div>
        </div>
        <div className="md:col-span-2">
          <div className="font-medium text-gray-800">Location</div>
          <div>{appointment.location}</div>
        </div>
      </div>

      {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onCancel?.(appointment.id)}
            className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white"
          >
            Cancel appointment
          </button>
        </div>
      )}
    </div>
  );
}
