"use client";

import React from 'react';

export default function LoadingSpinner({ size = 6 }: { size?: number }) {
  const sz = `${size}rem`;
  return (
    <div role="status" className="flex items-center justify-center">
      <svg
        style={{ width: sz, height: sz }}
        className="animate-spin text-blue-600"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"></circle>
        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
      </svg>
    </div>
  );
}
