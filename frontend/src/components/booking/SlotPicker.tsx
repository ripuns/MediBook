"use client";

import React from 'react';

export type SlotPickerProps = {
  selectedSlot: string;
  onSelect: (slot: string) => void;
  slots: string[];
  loading?: boolean;
};

export default function SlotPicker({ selectedSlot, onSelect, slots, loading }: SlotPickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Choose a time slot</h3>
      {loading ? <div className="text-sm text-gray-500">Loading available slots…</div> : null}
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
