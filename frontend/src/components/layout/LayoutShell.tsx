"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Clean checks for pages where sidebar/navbar are not needed
  const isAuthPage = pathname?.startsWith('/auth');
  const isLandingPage = pathname === '/';

  if (isAuthPage || isLandingPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col w-full">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}

