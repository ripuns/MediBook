"use client";

import React from 'react';

const slots = [
  'Today, 9:00 AM',
  'Today, 11:30 AM',
  'Tomorrow, 9:30 AM',
  'Tomorrow, 1:00 PM',
  'Wed, 10:15 AM',
  'Wed, 3:45 PM',
  'Thu, 8:30 AM',
  'Thu, 2:00 PM',
];

export default function SlotPicker({ selectedSlot, onSelect }: { selectedSlot: string; onSelect: (slot: string) => void }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Choose a time slot</h3>
      <div className="flex flex-wrap gap-3">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={`rounded border px-3 py-2 text-sm ${
              selectedSlot === slot ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
