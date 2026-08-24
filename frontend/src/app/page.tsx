"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Stethoscope, 
  CalendarCheck2, 
  UserCheck, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const role = user?.role;

  const getDashboardLink = () => {
    if (role === 'DOCTOR') return '/doctor/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">
            MediBook
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href={getDashboardLink()} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main hero section */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-1 flex flex-col justify-center py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/60 text-xs font-semibold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Smart Scheduling</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Calm, modern care scheduling <span className="text-indigo-600">simplified</span>.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              MediBook connects patients, clinicians, and administrators in a single, high-fidelity scheduling ecosystem. Complete with real-time slot holds, Google Calendar sync, and pre-visit AI insights.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {user ? (
                <Link 
                  href={getDashboardLink()} 
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white text-base font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all duration-200"
                >
                  <span>Welcome Back — View Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/register" 
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white text-base font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all duration-200"
                  >
                    <span>Book Your First Visit</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    href="/auth/login" 
                    className="px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-base font-bold hover:bg-slate-50 transition-all duration-200"
                  >
                    Clinician & Admin Log In
                  </Link>
                </>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Google Calendar Real-Time Sync</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>AI pre-visit symptom summaries</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Temporary reservation hold protection</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Automated medication reminders</span>
              </div>
            </div>
          </div>

          {/* Right graphics panel */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {/* Patient card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">For Patients</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Discover clinicians, select available slots with instant hold safety, input symptoms, and sync with your personal Google Calendar.
                </p>
              </div>
              <Link 
                href="/auth/register?role=PATIENT"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:translate-x-0.5 transition-all"
              >
                <span>Register as Patient</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            </div>

            {/* Doctor card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">For Clinicians</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Streamlined daily scheduling queues, clinical note records, AI pre-visit insights, and prescription creation tools.
                </p>
              </div>
              <Link 
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:translate-x-0.5 transition-all"
              >
                <span>Access Provider Desk</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            </div>

            {/* Admin card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between sm:col-span-2 lg:col-span-1 xl:col-span-2">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">For Administrators</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Clinic dashboard metrics overview, doctor onboarding and profile updating, leave calendar management, and system notification status monitoring.
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4 flex justify-end">
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-all"
                >
                  <span>Admin Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="bg-slate-900 text-slate-500 py-10 px-6 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">MediBook Scheduling Platform</span>
          </div>
          <div>
            &copy; 2026 MediBook. All rights reserved. Calm Clinician Ecosystem.
          </div>
        </div>
      </footer>
    </div>
  );
}
