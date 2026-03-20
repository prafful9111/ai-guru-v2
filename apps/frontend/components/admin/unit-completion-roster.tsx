"use client";

import React from "react";
import { CheckCircle2, Clock, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MOCK_COMPLETED = [
  { name: "Dr. Ahmed Khan", role: "Sr. Cardiologist", score: "94%" },
  { name: "Sarah Jenkins", role: "Head Nurse", score: "88%" },
  { name: "Priya Nair", role: "Radiology Tech", score: "91%" },
  { name: "David Chen", role: "Pharmacist", score: "85%" },
];

const MOCK_PENDING = [
  { name: "Maria Lopez", role: "ER Nurse", status: "Overdue 2 Days", priority: "High" },
  { name: "Tom Bradley", role: "Junior Surgeon", status: "Starts Tomorrow", priority: "Normal" },
  { name: "Aisha Malik", role: "Oncologist", status: "In Progress", priority: "Normal" },
];

export function UnitCompletionRoster() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-800">Staff Assessment Roster</h3>
          <p className="text-[12px] text-slate-500">Live tracker for unit compliance</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Find team member..." 
            className="h-8 pl-8 text-[12px] bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 flex-1">
        
        {/* Completed Column */}
        <div className="flex-1 p-4 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-[13px] font-semibold text-emerald-800">Completed <span className="text-emerald-600/60 font-medium">({MOCK_COMPLETED.length})</span></h4>
          </div>
          
          <div className="space-y-2">
            {MOCK_COMPLETED.map((staff, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-800 leading-tight">{staff.name}</p>
                    <p className="text-[11px] text-slate-500">{staff.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-emerald-700">{staff.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Column */}
        <div className="flex-1 p-4 bg-slate-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-[13px] font-semibold text-amber-800">Action Required <span className="text-amber-600/60 font-medium">({MOCK_PENDING.length})</span></h4>
            </div>
            <button className="text-[11px] font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors">
              <Mail className="h-3 w-3" /> Nudge All
            </button>
          </div>
          
          <div className="space-y-2">
            {MOCK_PENDING.map((staff, idx) => {
              const isOverdue = staff.priority === "High";
              return (
                <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors group ${isOverdue ? 'border-rose-200 bg-rose-50/30 hover:bg-rose-50/60' : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/60'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-slate-800 leading-tight">{staff.name}</p>
                      <p className="text-[11px] text-slate-500">{staff.role}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider px-1.5 border-none shadow-none bg-white ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                      {staff.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
