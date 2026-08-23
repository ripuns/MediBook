"use client";

import React, { useState } from 'react';

export default function NewDoctorPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    specialty: 'Cardiology',
    clinic: 'Downtown Clinic',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Doctor ${form.name} created successfully`);
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
          <label className="mb-1 block text-sm font-medium">Specialty</label>
          <select
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
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
          <label className="mb-1 block text-sm font-medium">Clinic</label>
          <input
            type="text"
            value={form.clinic}
            onChange={(e) => setForm({ ...form, clinic: e.target.value })}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" className="rounded border px-4 py-2 text-gray-700">
            Cancel
          </button>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Save Doctor
          </button>
        </div>
      </form>
    </div>
  );
}
