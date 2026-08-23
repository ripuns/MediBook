import React from 'react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Doctor Portal</h1>
        <p className="text-sm text-gray-600">Review patient summaries and finalize visit notes.</p>
      </div>
      {children}
    </div>
  );
}
