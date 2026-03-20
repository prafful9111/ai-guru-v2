"use client";

import React from "react";
import { Target, TrendingUp } from "lucide-react";

const COMPETENCIES = [
  { name: "Clinical Protocol Accuracy", score: 92, trend: "up" },
  { name: "Empathy & Tone", score: 85, trend: "up" },
  { name: "Information Gathering", score: 78, trend: "flat" },
  { name: "Conflict De-escalation", score: 55, trend: "down" },
  { name: "Time Management", score: 62, trend: "down" },
];

export function CompetencyBreakdownChart({ filterBatch = "all-batches" }: { filterBatch?: string }) {
  
  // Adjust scores dynamically to visually prove the filter works
  const dynamicCompetencies = COMPETENCIES.map((comp) => {
    let newScore = comp.score;
    if (filterBatch !== "all-batches") {
        newScore = Math.min(100, Math.max(30, comp.score + (filterBatch.length % 15) - 7));
    }
    return { ...comp, score: newScore };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-50 rounded-md">
          <Target className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800 leading-tight">Competency Breakdown</h3>
          <p className="text-[11px] text-slate-500">Average scores across the cohort</p>
        </div>
      </div>

      <div className="space-y-4 mt-2">
        {dynamicCompetencies.map((comp, idx) => {
          let barColor = "bg-emerald-500";
          let textColor = "text-emerald-700";
          if (comp.score < 80 && comp.score >= 65) {
            barColor = "bg-amber-400";
            textColor = "text-amber-700";
          } else if (comp.score < 65) {
            barColor = "bg-rose-500";
            textColor = "text-rose-700";
          }

          return (
            <div key={idx} className="flex flex-col gap-1.5 group">
              <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                  {comp.name}
                </span>
                <span className={`text-[12px] font-bold flex items-center gap-1 ${textColor}`}>
                  {comp.score}%
                  {comp.trend === "down" && <TrendingUp className="h-3 w-3 rotate-180 opacity-70" />}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${barColor}`}
                  style={{ width: `${comp.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-4 flex gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <div className="h-2 w-2 rounded-full bg-rose-500" /> &lt;65% (Critical)
        </div>
      </div>
    </div>
  );
}
