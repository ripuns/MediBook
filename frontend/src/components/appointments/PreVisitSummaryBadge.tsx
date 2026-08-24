"use client";

import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';

export default function PreVisitSummaryBadge({
  summary,
}: {
  summary?: string;
}) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 p-5 shadow-sm space-y-3.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
          <BrainCircuit className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900 leading-tight">AI Pre-Visit Assessment</h4>
          <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">Clinical Insight Summary</span>
        </div>
      </div>

      <div className="text-sm text-indigo-950/80 leading-relaxed font-medium pl-0.5">
        {summary ?? 'No pre-visit summary available for this consultation yet.'}
      </div>

      <div className="pt-2 flex items-center gap-1 text-[10px] text-indigo-600 font-semibold uppercase tracking-widest border-t border-indigo-200/50">
        <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
        <span>Generated from patient symptoms intake form</span>
      </div>
    </div>
  );
}
