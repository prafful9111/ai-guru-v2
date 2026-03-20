"use client";

import React from "react";
import { AlertCircle, UserX, MessageSquareWarning, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PITFALLS = [
  {
    icon: MessageSquareWarning,
    category: "Communication",
    issue: "Did not introduce role clearly",
    count: 5,
    description: "Failed to establish authority and explain purpose to the patient.",
    color: "amber"
  },
  {
    icon: Activity,
    category: "Clinical Accuracy",
    issue: "Incorrect dosage administered",
    count: 3,
    description: "Mixed up mg vs mcg in high-stress scenario.",
    color: "rose"
  },
  {
    icon: UserX,
    category: "Empathy",
    issue: "Ignored patient distress cues",
    count: 2,
    description: "Continued with protocol without acknowledging patient pain level.",
    color: "amber"
  }
];

export function CommonPitfallsFeed({ filterBatch = "all-batches" }: { filterBatch?: string }) {
  
  // Deterministically alter the array so the visual updates based on filter
  const displayPitfalls = filterBatch !== "all-batches" 
      ? [...PITFALLS].reverse() 
      : PITFALLS;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <div className="p-1.5 bg-rose-50 rounded-md">
          <AlertCircle className="h-4 w-4 text-rose-600" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800 leading-tight">Common Pitfalls</h3>
          <p className="text-[11px] text-slate-500">Top failure reasons in this cohort</p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {displayPitfalls.map((pitfall, idx) => {
          const Icon = pitfall.icon;
          const bgBadge = pitfall.color === 'rose' ? 'bg-rose-100/50 text-rose-700' : 'bg-amber-100/50 text-amber-700';
          const iconColor = pitfall.color === 'rose' ? 'text-rose-500' : 'text-amber-500';

          return (
            <div key={idx} className="flex gap-3 group">
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {pitfall.issue}
                  </h4>
                  <Badge variant="outline" className={`px-1.5 py-0 border-none shadow-none text-[9px] font-bold uppercase tracking-wider ${bgBadge}`}>
                    {pitfall.count} Users
                  </Badge>
                </div>
                <p className="text-[11.5px] text-slate-500 leading-snug">
                  {pitfall.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <button className="pt-4 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 w-full text-center transition-colors">
        View All Escalations &rarr;
      </button>
    </div>
  );
}
