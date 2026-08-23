"use client";

import React, { useState } from 'react';
import SlotPicker from '@/components/booking/SlotPicker';
import SymptomForm from '@/components/booking/SymptomForm';

const doctor = {
  id: 'dr-101',
  name: 'Dr. Maya Patel',
  specialty: 'Cardiology',
  location: 'Downtown Clinic',
};

export default function BookDoctorPage({ params }: { params: { doctorId: string } }) {
  const [selectedSlot, setSelectedSlot] = useState('Today, 9:00 AM');
  const [form, setForm] = useState({ symptoms: '', notes: '' });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Booking created for ${doctor.name} at ${selectedSlot}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-wide text-blue-700">Doctor</div>
        <h2 className="mt-2 text-2xl font-semibold">{doctor.name}</h2>
        <div className="mt-1 text-gray-600">{doctor.specialty} • {doctor.location}</div>
        <div className="mt-2 text-sm text-gray-500">Selected doctor ID: {params.doctorId}</div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <SlotPicker selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
      </div>

      <SymptomForm form={form} onChange={handleChange} onSubmit={handleSubmit} />
    </div>
  );
}
