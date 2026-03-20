"use client";

import React, { useState } from "react";
import { User, Activity, Lock, Calendar, MessageSquare, ArrowRight, ShieldAlert, CheckCircle2, Navigation } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const TIMELINE = [
  { date: "Aug 15", event: "Joined Organization", icon: User, color: "text-slate-500", bg: "bg-slate-100", border: 'border-slate-200' },
  { date: "Aug 20", event: "Orientation Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: 'border-emerald-200' },
  { date: "Oct 12", event: "Initial RAG AI Assessment", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50", border: 'border-red-200', note: "Failed Conflict Resolution (Score: 58%)" },
  { date: "Oct 15", event: "Automated Bridge Training", icon: Calendar, color: "text-amber-500", bg: "bg-amber-50", border: 'border-amber-200' },
  { date: "Nov 01", event: "Follow-up Re-evaluation", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: 'border-emerald-200', note: "Passed (Score: 88%)" },
];

export function EmployeeJourneyTab() {
  const searchParams = useSearchParams();
  const rawStaff = searchParams.get("staff");
  const staffParam = rawStaff && rawStaff !== "all-staff" ? rawStaff : null;
  
  // Minimal manual map based on the existing Matrix data IDs
  const STAFF_DETAILS: Record<string, {name: string, initials: string, role: string, dept: string}> = {
    "EMP-04821": { name: "Priya Sharma", initials: "PS", role: "Senior ICU Nurse", dept: "ICU Wing" },
    "EMP-09231": { name: "Michael Chang", initials: "MC", role: "Pediatric Attending", dept: "Pediatrics" },
    "EMP-05512": { name: "Alisha Davis", initials: "AD", role: "ER Technician", dept: "Emergency (ER)" },
    "EMP-01124": { name: "Robert Jones", initials: "RJ", role: "Emergency RN", dept: "Emergency (ER)" },
    "EMP-03882": { name: "Lisa Smith", initials: "LS", role: "Admin Staff", dept: "Front Desk" },
    "EMP-06771": { name: "Tom Kumar", initials: "TK", role: "Nurse Grade I", dept: "Emergency (ER)" },
  };

  const isSpecificStaff = !!staffParam;
  const user = isSpecificStaff ? STAFF_DETAILS[staffParam] || { name: "Sarah Jenkins", initials: "SJ", role: "Nurse Grade II", dept: "Emergency Dept" } : null;

  if (!isSpecificStaff || !user) {
    return (
      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-3 min-h-[400px]">
        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm text-slate-400">
          <Navigation className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-slate-800">No Specific Staff Selected</h3>
          <p className="text-[13px] text-slate-500 max-w-sm mx-auto mt-1">Please select an individual staff member from the Global Filters above to view their 360° employee journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff Info & Context */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <h3 className="font-semibold text-slate-800 text-[14px]">Staff Profile</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex items-center gap-4">
                   <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner uppercase">
                     {user.initials}
                   </div>
                   <div>
                     <h2 className="text-lg font-semibold text-slate-900">{user.name}</h2>
                     <p className="text-[13px] text-slate-500 font-medium">{user.role}</p>
                   </div>
                 </div>
                 <div className="pt-4 border-t border-slate-100 space-y-3">
                   <div className="flex justify-between text-[13px]">
                     <span className="text-slate-500">Department</span>
                     <span className="font-medium text-slate-800">{user.dept}</span>
                   </div>
                   <div className="flex justify-between text-[13px]">
                     <span className="text-slate-500">Date Joined</span>
                     <span className="font-medium text-slate-800">Aug 15, 2024</span>
                   </div>
                   <div className="flex justify-between text-[13px]">
                     <span className="text-slate-500">Current Status</span>
                     <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Certified</span>
                   </div>
                 </div>
              </div>
            </div>

            {/* Credential Vault */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-[13px] flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-slate-400" /> Administrative Vault
                </h3>
              </div>
              <div className="p-6 space-y-5">
                 <div>
                   <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Active Assessments</p>
                   <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-[12px] flex justify-between items-center shadow-sm">
                     <span className="font-medium text-slate-700">De-escalation Vol 2</span>
                     <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-800">Copy Link</a>
                   </div>
                 </div>
                 <div>
                   <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">System Credentials</p>
                   <div className="space-y-2">
                     <div className="flex justify-between text-[12px]">
                       <span className="text-slate-500">Username</span>
                       <span className="font-mono text-slate-800">s.jenkins@hospital.org</span>
                     </div>
                     <div className="flex justify-between text-[12px]">
                       <span className="text-slate-500">Passcode</span>
                       <span className="font-mono text-slate-800">SJ-8492-XT</span>
                     </div>
                   </div>
                 </div>
                 <Button variant="outline" className="w-full text-[12px] h-8 gap-2 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100">
                   <MessageSquare className="h-3.5 w-3.5" /> View Chat Transcripts
                 </Button>
              </div>
            </div>
          </div>

          {/* Timeline Journey (Vertical) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
               <Activity className="h-4 w-4 text-slate-500" />
               <h3 className="font-semibold text-slate-800 text-[14px]">Staff Action History & Journey</h3>
            </div>
            <div className="p-6 flex-1 bg-slate-50/30">
               <div className="relative pl-4 sm:pl-8 space-y-6">
                  {/* Vertical Connector line */}
                  <div className="absolute top-2 bottom-6 left-8 sm:left-12 w-0.5 bg-slate-200 z-0"></div>
                  
                  {TIMELINE.map((node, i) => {
                     const Icon = node.icon;
                     return (
                     <div key={i} className="relative z-10 flex gap-4 sm:gap-6 items-start">
                        <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center border-2 shadow-sm bg-white ${node.border} ${node.color} mt-0.5`}>
                           <Icon className="h-4 w-4" />
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex-1 relative mt-0">
                          {/* Arrow tip connecting to circle */}
                          <div className="hidden sm:block absolute top-[18px] -left-2 w-2 h-2 bg-white border-l border-b border-slate-200 transform rotate-45"></div>
                          
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{node.date}</p>
                          <p className="text-[14px] font-semibold text-slate-800 leading-tight mb-2">{node.event}</p>
                          {node.note && (
                            <div className={`text-[12px] font-medium p-2 rounded border bg-opacity-50 inline-block ${node.bg} ${node.color} ${node.border}`}>
                              {node.note}
                            </div>
                          )}
                        </div>
                     </div>
                     );
                  })}
               </div>
            </div>
          </div>

        </div>

    </div>
  );
}
