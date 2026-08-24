"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Bell, 
  Stethoscope, 
  LogOut, 
  Activity 
} from 'lucide-react';

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NavItem: React.FC<NavItemProps> = ({ href, label, icon }) => {
  const path = usePathname();
  const active = path === href || path?.startsWith(href + '/');
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50/50' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className={`transition-transform duration-200 ${active ? 'scale-110 text-indigo-600' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 z-40">
      {/* Brand header */}
      <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">MediBook</h3>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Portal</span>
        </div>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {role === 'DOCTOR' ? (
          <>
            <NavItem href="/doctor/dashboard" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
            <NavItem href="/doctor/appointments" label="Appointments" icon={<Calendar className="w-4 h-4" />} />
          </>
        ) : null}
        {role === 'ADMIN' ? (
          <>
            <NavItem href="/admin/dashboard" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
            <NavItem href="/admin/doctors" label="Doctors" icon={<Users className="w-4 h-4" />} />
            <NavItem href="/admin/appointments" label="Appointments" icon={<Calendar className="w-4 h-4" />} />
            <NavItem href="/admin/notifications" label="Notifications" icon={<Bell className="w-4 h-4" />} />
          </>
        ) : null}
        {role === 'PATIENT' || !role ? (
          <>
            <NavItem href="/patient/dashboard" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
            <NavItem href="/patient/doctors" label="Find Doctors" icon={<Stethoscope className="w-4 h-4" />} />
            <NavItem href="/patient/appointments" label="My Visits" icon={<Calendar className="w-4 h-4" />} />
          </>
        ) : null}
      </nav>

      {/* Footer / User display */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 truncate">Logged in as</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{user?.email ?? 'Guest User'}</p>
            </div>
          </div>

          {user ? (
            <button
              onClick={() => void logout()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100/80 transition-all duration-200 border border-red-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link 
              href="/auth/login" 
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/85 transition-all duration-200 border border-indigo-100"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
