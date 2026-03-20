"use client";

import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export function UnitPerformanceSummary() {
  const topSkills = [
    { name: "De-escalation", score: "94%" },
    { name: "Empathy & Active Listening", score: "91%" },
    { name: "Clinical Protocol Compliance", score: "88%" },
  ];

  const actionAreas = [
    { name: "Rapid Handover Accuracy", score: "62%", trend: "down" },
    { name: "Time-critical Reporting", score: "58%", trend: "down" },
    { name: "Cross-cultural Communication", score: "65%", trend: "flat" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Top Skills */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
          <div className="p-1.5 bg-emerald-100 rounded-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="text-[14px] font-semibold text-slate-800">Top Performing Skills</h3>
        </div>
        <div className="space-y-3">
          {topSkills.map((skill, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 group">
              <div className="flex justify-between items-end">
                <span className="text-[13px] font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">{skill.name}</span>
                <span className="text-[12px] font-bold text-emerald-700">{skill.score}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-1.5 bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: skill.score }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Areas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
          <div className="p-1.5 bg-rose-100 rounded-md">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <h3 className="text-[14px] font-semibold text-slate-800">Critical Action Areas</h3>
        </div>
        <div className="space-y-3">
          {actionAreas.map((area, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 group">
              <div className="flex justify-between items-end">
                <span className="text-[13px] font-medium text-slate-700 group-hover:text-rose-700 transition-colors">{area.name}</span>
                <span className="text-[12px] font-bold text-rose-700 flex items-center gap-1">
                  {area.score}
                  {area.trend === 'down' && <TrendingUp className="h-3 w-3 text-rose-500 rotate-180" />}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-1.5 bg-rose-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: area.score }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
