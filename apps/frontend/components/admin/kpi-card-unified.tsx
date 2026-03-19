"use client";

import React from "react";

interface KpiCardUnifiedProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  iconColor: string;
  accentBorder?: string;
}

/**
 * Standardized KPI Card for the AI-Guru Admin Dashboard.
 * Matches the "Overview & Status" design with:
 * - [10px] font-semibold uppercase tracking-widest text-slate-400 (Label)
 * - [XL] font-bold text-slate-800 leading-none (Value)
 * - [11px] text-slate-500 mt-1 leading-tight (Subtext)
 * - [4px py-3], [min-h-[96px]] (Padding & Height)
 */
export function KpiCardUnified({ 
  label, 
  value, 
  sub, 
  icon, 
  iconColor, 
  accentBorder 
}: KpiCardUnifiedProps) {
  return (
    <div
      className={`flex flex-col justify-between bg-white border border-slate-200 rounded-md px-4 py-3 min-h-[96px] shadow-sm relative overflow-hidden transition-all hover:border-slate-300 ${accentBorder ?? ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <span className={`${iconColor}`}>{icon}</span>
      </div>
      <div>
        <div className="text-xl font-bold text-slate-800 leading-tight">{value}</div>
        {sub && (
          <div className="text-[11px] font-medium mt-2 leading-tight">{sub}</div>
        )}
      </div>
    </div>
  );
}
