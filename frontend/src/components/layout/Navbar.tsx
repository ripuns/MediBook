"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white border-b p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold">MediBook</Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-700">{user.name ?? user.email}</span>
            <button onClick={() => void logout()} className="text-sm text-red-600">Logout</button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="text-sm text-blue-600">Login</Link>
            <Link href="/auth/register" className="text-sm text-green-600">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
