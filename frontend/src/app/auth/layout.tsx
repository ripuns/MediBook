import React from 'react';
import Link from 'next/link';
import { Stethoscope, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/50 via-slate-50 to-indigo-100/30 p-4 sm:p-6">
      <div className="mb-6 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition-all">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">MediBook</span>
        </Link>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200/85 shadow-xl shadow-slate-100/50">
        {children}
      </div>

      <Link 
        href="/" 
        className="mt-6 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to homepage</span>
      </Link>
    </div>
  );
}
