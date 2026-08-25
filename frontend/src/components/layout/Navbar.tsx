"use client";

import React, {useState} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Activity } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onClick = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        await logout();
        router.push('/auth/login');
      } catch (err: any) {
        console.warn('Registration failure details:', err);
        setError(err?.response?.data?.message ?? err?.message ?? 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
  const getRoleLabelAndBadge = (role?: string | null) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'DOCTOR':
        return { label: 'Clinician', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'PATIENT':
        return { label: 'Patient', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Guest', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleLabelAndBadge(user?.role);

  return (
    <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
          <Activity className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold text-slate-800 tracking-wide uppercase">
          {roleInfo.label} Workspace
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700 leading-tight">
                  {user.name || user.email}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold tracking-wider uppercase mt-0.5 ${roleInfo.badgeClass}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <button
              onClick={onClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
