"use client";

import React from "react";
import { TrendingDown, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_LAGGING_UNITS = [
  { name: "Emergency (ER)", reason: "34 Overdue Assessments", metric: "62% Compliance" },
  { name: "Radiology", reason: "AI Chat Soft Skills Avg < 60%", metric: "12 Escalations" },
  { name: "Front Desk (Main)", reason: "Compliance Deadline Breach", metric: "45 Days Avg" },
];

/**
 * Standardized Priority Focus Areas component.
 * Extracted from the Leadership Board to improve spacing and modularity.
 */
export function PriorityFocusAreas() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-red-50/30 flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-red-500" />
        <h3 className="font-semibold text-slate-800 text-[13px] tracking-tight">Priority Focus Areas</h3>
      </div>
      
      {/* Info Context */}
      <div className="flex-1 p-0 flex flex-col">
        <div className="p-4 py-3 text-[11px] text-slate-500 leading-relaxed border-b border-slate-100 bg-slate-50/30">
          The following units require administrative support to clear assessment backlogs or address critical SOP gaps.
        </div>
        
        {/* List of Units */}
        <div className="flex flex-col">
          {MOCK_LAGGING_UNITS.map((unit, i) => (
            <div key={i} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-1.5">
                <span className="font-bold text-slate-800 text-[13.5px] tracking-tight">{unit.name}</span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {unit.metric}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 font-medium mb-3.5 leading-tight">{unit.reason}</p>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold gap-1.5 text-slate-600 border-slate-200 flex-1 hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-all hover:border-slate-300">
                   <Calendar className="h-3.5 w-3.5" />
                   Intervention
                 </Button>
                 <Button variant="outline" size="sm" className="h-8 w-8 p-0 flex-shrink-0 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all" title="Message Manager">
                   <Mail className="h-3.5 w-3.5" />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
