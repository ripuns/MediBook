"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NavItem: React.FC<{ href: string; label: string }> = ({ href, label }) => {
  const path = usePathname();
  const active = path === href;
  return (
    <Link href={href} className={`block px-3 py-2 rounded ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
      {label}
    </Link>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <aside className="w-64 bg-white border-r h-screen p-4 sticky top-0">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">MediBook</h3>
        <div className="text-sm text-gray-500">{user?.email ?? 'Guest'}</div>
      </div>

      <nav className="space-y-1">
        {role === 'DOCTOR' ? (
          <>
            <NavItem href="/doctor/dashboard" label="Dashboard" />
            <NavItem href="/doctor/dashboard" label="Appointments" />
          </>
        ) : null}
        {role === 'ADMIN' ? (
          <>
            <NavItem href="/admin/dashboard" label="Dashboard" />
            <NavItem href="/admin/doctors" label="Doctors" />
            <NavItem href="/admin/appointments" label="Appointments" />
            <NavItem href="/admin/notifications" label="Notifications" />
          </>
        ) : null}
        {role === 'PATIENT' || !role ? (
          <>
            <NavItem href="/patient/dashboard" label="Dashboard" />
            <NavItem href="/patient/doctors" label="Doctors" />
            <NavItem href="/patient/appointments" label="Appointments" />
          </>
        ) : null}
      </nav>

      <div className="mt-6 border-t pt-4">
        {user ? (
          <button
            onClick={() => void logout()}
            className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        ) : (
          <Link href="/auth/login" className="block px-3 py-2 rounded text-blue-600 hover:bg-blue-50">
            Login
          </Link>
        )}
      </div>
    </aside>
  );
}
