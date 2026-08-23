"use client";

import React from 'react';

export default function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
      {message}
    </div>
  );
}
