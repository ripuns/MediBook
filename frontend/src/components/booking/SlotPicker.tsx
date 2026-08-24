"use client";

import React from 'react';
import { Clock } from 'lucide-react';

export type SlotPickerProps = {
  selectedSlot: string;
  onSelect: (slot: string) => void;
  slots: string[];
  loading?: boolean;
};

function formatTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function SlotPicker({ selectedSlot, onSelect, slots, loading }: SlotPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-800">Select Available Slot</h3>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500 flex items-center gap-2 py-4">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
          <span>Checking real-time calendar availability…</span>
        </div>
      ) : slots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelect(slot)}
                className={`py-3 px-4 text-sm font-semibold rounded-xl border text-center transition-all duration-200 focus:outline-none focus:ring-4 ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50 focus:ring-indigo-100' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50 focus:ring-slate-100'
                }`}
              >
                {formatTime(slot)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 py-8 text-center text-sm text-slate-500">
          No available appointment slots for the selected date. Please choose a different date.
        </div>
      )}
    </div>
  );
}
