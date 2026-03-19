"use client";

import React from "react";
import { TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react";

export function QuickInsights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* KPI 1: Top Strengths */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Top Strengths
          </p>
          <span className="text-[10px] text-slate-400 font-medium">98% Avg.</span>
        </div>
        <div className="space-y-3 flex-1">
          {[
            { name: "HIPAA Compliance", score: 98 },
            { name: "Patient Identification", score: 94 },
          ].map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-700">{s.name}</span>
                <span className="font-bold text-emerald-700">{s.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI 2: Key Weaknesses */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> Key Weaknesses
          </p>
          <span className="text-[10px] text-slate-400 font-medium">58% Avg.</span>
        </div>
        <div className="space-y-3 flex-1">
          {[
            { name: "De-escalation SOP", score: 62 },
            { name: "Billing Conflict Handling", score: 54 },
          ].map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-700">{s.name}</span>
                <span className="font-bold text-red-600">{s.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-red-50 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI 3: Avg. Retake Time */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Clock className="h-3 w-3" /> Avg. Retake Time
          </p>
          <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
            <AlertCircle className="h-3 w-3" /> 8 Flagged
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between p-2 bg-emerald-50/50 rounded border border-emerald-100/50">
            <span className="text-[11px] text-slate-600">Green (Low Risk)</span>
            <span className="text-[11px] font-bold text-emerald-700">1.2 Days</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-amber-50/50 rounded border border-amber-100/50">
            <span className="text-[11px] text-slate-600">Amber (Developing)</span>
            <span className="text-[11px] font-bold text-amber-700">2.4 Days</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-red-50/50 rounded border border-red-100/50">
            <span className="text-[11px] text-slate-600">Red (High Risk)</span>
            <span className="text-[11px] font-bold text-red-600">5.8 Days</span>
          </div>
        </div>
      </div>

    </div>
  );
}
