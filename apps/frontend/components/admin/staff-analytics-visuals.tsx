"use client";

import React from "react";
import { AlertCircle, FileWarning, BarChart4, TrendingUp, GitMerge, FileX } from "lucide-react";

// --- Mock Aggregated Data ---
// These mimic what we saw in `ReportData.roleplayEvaluation.parameter_scores`
// Note: Colors will now be dynamically calculated via RAG logic instead of hardcoded track configs
const PARAMETER_AVERAGES = [
  { name: "Greeting & Empathy", score: 8.5, max: 10 },
  { name: "Information Gathering", score: 6.2, max: 10 },
  { name: "Clinical Explanation", score: 7.8, max: 10 },
  { name: "Handling Objections", score: 4.1, max: 10 },
  { name: "Closing / Next Steps", score: 9.0, max: 10 },
];

// These mimic what we saw in `ReportData.roleplayEvaluation.sop_adherence.violations_or_do_not_behaviours`
const TOP_VIOLATIONS = [
  { count: 142, text: "Did not verify patient identity before discussing financials", severity: "high" },
  { count: 89, text: "Interrupting patient while describing symptoms", severity: "medium" },
  { count: 67, text: "Failed to offer alternative payment options", severity: "high" },
  { count: 45, text: "Used overly complex medical jargon", severity: "low" }
];

export const StaffAnalyticsVisuals = () => {
  return (
    <div className="space-y-6 mb-6">
      
      {/* Target Focus: Analytics Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-0">
        
        {/* Left Focus: SOP Violations Hit List (White Card UI Polish) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_6px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between h-full relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-rose-500" />
                SOP Adherence Violations
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  <TrendingUp className="w-3 h-3" /> Live
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              The most frequent 'Do Not Behaviours' and missing checklist stages automatically extracted from AI Session Evaluation Reports.
            </p>

            <div className="space-y-3 flex-1">
              {TOP_VIOLATIONS.map((violation, index) => (
                <div 
                  key={index} 
                  className="group flex gap-3 items-start p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 font-mono font-bold text-slate-500 text-xs shadow-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-medium text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                      {violation.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <FileX className="w-3.5 h-3.5 text-slate-400" />
                        Occurred {violation.count} times
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          violation.severity === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          violation.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {violation.severity} Risk
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle View All Button */}
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-all">
                View All Violations <span className="text-blue-400">→</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Focus: Parameter Averages (White Card UI Polish) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_6px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <BarChart4 className="w-5 h-5 text-[#2d87a4]" />
                Core Parameters
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">All Units</span>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Aggregated scores mapping exactly to the structural parameters defined within scenario prompt matrices. 
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between mt-6">
            {PARAMETER_AVERAGES.map((param, index) => {
              const percentage = (param.score / param.max) * 100;
              
              // Dynamic RAG Colors based on score thresholds
              let visualColor = "bg-emerald-500";
              let trackColor = "bg-emerald-100";
              let trendColor = "text-emerald-500";
              let trendIcon = "↑";
              
              if (percentage < 60) {
                visualColor = "bg-rose-500";
                trackColor = "bg-rose-100";
                trendColor = "text-rose-500";
                trendIcon = "↓";
              } else if (percentage < 80) {
                visualColor = "bg-amber-400";
                trackColor = "bg-amber-100";
                trendColor = "text-amber-500";
                trendIcon = "→";
              }

              return (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{param.name}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{param.score.toFixed(1)}</span>
                      <span className="text-[10px] font-medium text-slate-400">/ {param.max}</span>
                      <span className={`text-[10px] font-bold ml-1 ${trendColor} flex items-center`}>
                        {trendIcon} <span className="ml-0.5">{(Math.random() * 5 + 1).toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                  <div className={`h-1.5 w-full rounded-full ${trackColor} overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${visualColor}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
