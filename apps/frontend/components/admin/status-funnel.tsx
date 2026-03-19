"use client";

import React from "react";
import { CheckCircle2, Clock, AlertTriangle, RotateCcw, CalendarDays, Users, ChevronRight, TrendingUp, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { KpiCardUnified } from "./kpi-card-unified";

const METRICS = {
  totalAssigned: 500,
  completed: 450,
  inProgress: 23,
  overdue: 27,
  reEvalQueue: 8,
  upcomingToDo: 12,
};

export function StatusFunnel() {
  const completedPct = Math.round((METRICS.completed / METRICS.totalAssigned) * 100);
  const inProgressPct = Math.round((METRICS.inProgress / METRICS.totalAssigned) * 100);

  return (
    <div className="space-y-6">
      {/* ── KPI Row — strict 5-column grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Completion */}
        <KpiCardUnified
          label="Completion Rate"
          value={
            <div className="flex items-baseline gap-1">
              <span>{METRICS.completed}</span>
              <span className="text-sm font-normal text-slate-400">/ {METRICS.totalAssigned}</span>
            </div>
          }
          sub={
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-600 font-medium">{completedPct}% completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div
                  className="h-1 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${completedPct}%` }}
                />
              </div>
            </div>
          }
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          iconColor="text-emerald-500"
        />

        {/* Card 2: In-Progress */}
        <KpiCardUnified
          label="In-Progress"
          value={METRICS.inProgress}
          sub="Actively engaging with AI"
          icon={<Clock className="h-3.5 w-3.5" />}
          iconColor="text-amber-500"
        />

        {/* Card 3: Overdue */}
        <KpiCardUnified
          label="Overdue"
          value={<span className="text-red-700">{METRICS.overdue}</span>}
          sub={<span className="text-red-600 font-medium">Require immediate action</span>}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          iconColor="text-red-500"
          accentBorder="border-l-2 border-l-red-400"
        />

        {/* Card 4: Re-Eval Queue */}
        <KpiCardUnified
          label="Re-Eval Queue"
          value={METRICS.reEvalQueue}
          sub="Mandatory retakes triggered"
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          iconColor="text-amber-600"
        />

        {/* Card 5: Upcoming To-Do */}
        <KpiCardUnified
          label="Upcoming To-Do"
          value={METRICS.upcomingToDo}
          sub="Scheduled, not yet started"
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          iconColor="text-slate-500"
        />
      </div>

      {/* ── Compliance Pipeline (Redesigned) ── */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <h3 className="text-[14px] font-semibold text-slate-800 tracking-tight">Compliance Flow Pipeline</h3>
            </div>
            <span className="border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase text-slate-500 bg-white">
              Last 30 Days
            </span>
        </div>
        
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative z-10 w-full">
             
             {/* Stage 1 */}
             <div className="flex-1 w-full flex items-center justify-between p-3 bg-white rounded border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                <div className="flex items-center gap-2.5 pl-2">
                   <div className="h-7 w-7 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 shrink-0">
                      <Users className="h-3.5 w-3.5" />
                   </div>
                   <h4 className="text-[12px] font-semibold text-slate-700">1. Assigned</h4>
                </div>
                <div className="text-[14px] font-bold text-slate-800">{METRICS.totalAssigned}</div>
             </div>

             <div className="hidden md:block w-3 h-px bg-slate-300"></div>

             {/* Stage 2 */}
             <div className="flex-1 w-full flex items-center justify-between p-3 bg-white rounded border border-amber-200 shadow-sm relative overflow-hidden transition-all hover:border-amber-300 ring-1 ring-amber-500/5">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                <div className="flex items-center gap-2.5 pl-2">
                   <div className="h-7 w-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200 text-amber-600 shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                   </div>
                   <div className="flex items-center gap-2">
                     <h4 className="text-[12px] font-semibold text-amber-800">2. In Progress</h4>
                     <span className="text-[9px] text-red-600 font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase">{METRICS.overdue} Overdue</span>
                   </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-[14px] font-bold text-amber-700">{METRICS.inProgress}</div>
                  <div className="text-[10px] text-amber-600 font-medium">({inProgressPct}%)</div>
                </div>
             </div>

             <div className="hidden md:block w-3 h-px bg-slate-300"></div>

             {/* Stage 3 */}
             <div className="flex-1 w-full flex items-center justify-between p-3 bg-white rounded border border-emerald-200 shadow-sm relative overflow-hidden transition-all hover:border-emerald-300 ring-1 ring-emerald-500/5">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <div className="flex items-center gap-2.5 pl-2">
                   <div className="h-7 w-7 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 text-emerald-600 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                   </div>
                   <h4 className="text-[12px] font-semibold text-emerald-800">3. Completed</h4>
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-[14px] font-bold text-emerald-700">{METRICS.completed}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">({completedPct}%)</div>
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Section: Missing Components Restored ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Re-Evaluation Queue */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden lg:col-span-2 shadow-sm flex flex-col h-[320px]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-amber-600" />
              <div>
                <h3 className="text-[14px] font-semibold text-slate-800 leading-none">Re-Evaluation Queue</h3>
                <p className="text-[11px] text-slate-500 mt-1">Failed SOP checks requiring mandatory retakes</p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[11px] font-bold">{METRICS.reEvalQueue} Staff</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {[
                { name: "Sarah Jenkins", role: "ICU", scenario: "Code Blue", date: "Oct 24" },
                { name: "Dr. Ahmed Khan", role: "Cardiology", scenario: "Angry Patient", date: "Oct 22" },
                { name: "Maria Lopez", role: "Emergency", scenario: "Routine Checkup", date: "Oct 21" },
                { name: "Tom Bradley", role: "Pharmacy", scenario: "De-escalation", date: "Oct 20" }
              ].map((staff, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] uppercase group-hover:bg-white transition-colors">
                        {staff.name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-[13px] font-semibold text-slate-900 leading-tight">{staff.name}</p>
                       <p className="text-[11px] text-slate-500 mt-0.5">{staff.role} • Failed {staff.scenario}</p>
                     </div>
                  </div>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50/50 text-amber-700 text-[10px] uppercase font-bold px-2 whitespace-nowrap">
                    Retake Triggered
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* To-Do List */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm flex flex-col h-[320px]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <div>
                <h3 className="text-[14px] font-semibold text-slate-800 leading-none">Upcoming To-Do</h3>
                <p className="text-[11px] text-slate-500 mt-1">Scheduled assessments</p>
              </div>
            </div>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">{METRICS.upcomingToDo}</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {[
                { module: "Annual HIPAA Recert", dept: "All Staff", date: "Starts Nov 1" },
                { module: "New Defibrillator Models", dept: "Emergency & ICU", date: "Starts Nov 15" },
                { module: "Cybersecurity Basics", dept: "Administration", date: "Starts Nov 20" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-4 hover:bg-slate-50 transition-colors">
                  <p className="text-[12px] font-semibold text-slate-800 leading-tight">{item.module}</p>
                  <p className="text-[11px] text-slate-500">Target: {item.dept}</p>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none w-fit text-[10px] mt-1 shadow-none font-medium">
                    {item.date}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-center flex-shrink-0">
             <button className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
               View Full Schedule →
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
