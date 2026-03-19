"use client";

import React, { useState } from "react";
import { User, Activity, Lock, Calendar, MessageSquare, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const TIMELINE = [
  { date: "Aug 15", event: "Joined Organization", icon: User, color: "text-slate-500", bg: "bg-slate-100", border: 'border-slate-200' },
  { date: "Aug 20", event: "Orientation Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: 'border-emerald-200' },
  { date: "Oct 12", event: "Initial RAG AI Assessment", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50", border: 'border-red-200', note: "Failed Conflict Resolution (Score: 58%)" },
  { date: "Oct 15", event: "Automated Bridge Training", icon: Calendar, color: "text-amber-500", bg: "bg-amber-50", border: 'border-amber-200' },
  { date: "Nov 01", event: "Follow-up Re-evaluation", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: 'border-emerald-200', note: "Passed (Score: 88%)" },
];

export function EmployeeJourneyTab() {
  const [staff, setStaff] = useState("s-jenkins");

  return (
    <div className="space-y-6">
      
      {/* Staff Selector */}
      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
             SJ
           </div>
           <div>
             <h2 className="text-sm font-bold text-slate-900">Sarah Jenkins</h2>
             <p className="text-xs text-slate-500">Nurse Grade II • Emergency Dept</p>
           </div>
         </div>
         <div className="flex gap-3">
           <Select value={staff} onValueChange={setStaff}>
             <SelectTrigger className="h-9 w-[200px] text-sm">
               <SelectValue placeholder="Select Staff Member" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="s-jenkins">Sarah Jenkins (ER)</SelectItem>
               <SelectItem value="m-chang">Michael Chang (ICU)</SelectItem>
               <SelectItem value="a-davis">Alisha Davis (Radiology)</SelectItem>
             </SelectContent>
           </Select>
           <Button variant="outline" className="h-9 text-slate-600 bg-white shadow-sm hover:bg-slate-50">
             Export Profile
           </Button>
         </div>
      </div>

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
                   <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner">
                     SJ
                   </div>
                   <div>
                     <h2 className="text-lg font-semibold text-slate-900">Sarah Jenkins</h2>
                     <p className="text-[13px] text-slate-500 font-medium">Nurse Grade II</p>
                   </div>
                 </div>
                 <div className="pt-4 border-t border-slate-100 space-y-3">
                   <div className="flex justify-between text-[13px]">
                     <span className="text-slate-500">Department</span>
                     <span className="font-medium text-slate-800">Emergency Dept (ER)</span>
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
               <h3 className="font-semibold text-slate-800 text-[14px]">Comprehensive Information Journey</h3>
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
