import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <p className="text-sm text-gray-600">Manage doctors, schedules, and operational insights.</p>
      </div>
      {children}
    </div>
  );
}
