"use client";

import React from 'react';

export default function PreVisitSummaryBadge({
  summary,
}: {
  summary?: string;
}) {
  return (
    <div className="rounded border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
      <div className="font-medium">Pre-visit summary</div>
      <div className="mt-1 text-indigo-700">{summary ?? 'No pre-visit summary available yet.'}</div>
    </div>
  );
}
