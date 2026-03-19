"use client";

import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  CalendarDays,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_METRICS = {
  totalAssigned: 124,
  completed: 82,
  inProgress: 15,
  overdue: 27
};

export function StatusFunnel() {
  const completedPct = Math.round((MOCK_METRICS.completed / MOCK_METRICS.totalAssigned) * 100);
  const inProgressPct = Math.round((MOCK_METRICS.inProgress / MOCK_METRICS.totalAssigned) * 100);

  return (
    <div className="space-y-6">
      
      {/* 1. High Level Metrics Container (Moved to Top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{MOCK_METRICS.totalAssigned}</p>
              </div>
              <div className="p-2 bg-blue-50/50 rounded-md">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{MOCK_METRICS.completed}</p>
                  <span className="text-sm font-medium text-emerald-600">
                    {completedPct}%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-emerald-50/50 rounded-md">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">In-Progress</p>
                <p className="text-2xl font-bold text-gray-900">{MOCK_METRICS.inProgress}</p>
              </div>
              <div className="p-2 bg-amber-50/50 rounded-md relative">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-rose-600">{MOCK_METRICS.overdue}</p>
                  <span className="text-sm font-medium text-rose-500">+2</span>
                </div>
              </div>
              <div className="p-2 bg-rose-50/50 rounded-md">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Visual Funnel Breakdown (Re-visualized into a segmented pipeline) */}
      <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-100 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-gray-900">Compliance Flow Pipeline</h3>
            </div>
            <Badge variant="outline" className="bg-white text-gray-600">Last 30 Days</Badge>
        </div>
        <CardContent className="p-6 sm:p-8">
          
          <div className="flex flex-col md:flex-row items-center w-full gap-2 md:gap-0">
             
             {/* Stage 1: Assigned */}
             <div className="relative flex-1 bg-slate-100 px-6 py-5 rounded-lg md:rounded-r-none border border-slate-200 w-full group hover:bg-slate-200/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                   <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">1. Assigned</p>
                   <Users className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-bold text-gray-900">{MOCK_METRICS.totalAssigned}</p>
                   <p className="text-sm text-gray-500 font-medium tracking-tight">Staff</p>
                </div>
             </div>

             {/* Connecting Arrow */}
             <div className="hidden md:flex items-center justify-center -mx-4 z-10 w-10">
                <div className="bg-white rounded-full shadow-sm border border-gray-100 p-1">
                   <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
             </div>

             {/* Stage 2: In-Progress */}
             <div className="relative flex-1 bg-amber-50 px-6 py-5 rounded-lg md:rounded-none border border-amber-100 w-full group hover:bg-amber-100/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                   <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">2. In-Progress</p>
                   <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-bold text-amber-900">{MOCK_METRICS.inProgress}</p>
                   <p className="text-sm text-amber-700 font-medium tracking-tight">({inProgressPct}%)</p>
                </div>
                {/* Overdue sub-tag */}
                <div className="absolute -bottom-3 right-4 bg-rose-100 px-2 py-0.5 rounded shadow-sm border border-rose-200 text-[10px] font-bold text-rose-700 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {MOCK_METRICS.overdue} Overdue
                </div>
             </div>

             {/* Connecting Arrow */}
             <div className="hidden md:flex items-center justify-center -mx-4 z-10 w-10">
                <div className="bg-white rounded-full shadow-sm border border-gray-100 p-1">
                   <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
             </div>

             {/* Stage 3: Completed */}
             <div className="relative flex-1 bg-emerald-50 px-6 py-5 rounded-lg md:rounded-l-none border border-emerald-100 w-full group hover:bg-emerald-100/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                   <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">3. Completed</p>
                   <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-bold text-emerald-900">{MOCK_METRICS.completed}</p>
                   <p className="text-sm text-emerald-700 font-medium tracking-tight">({completedPct}%)</p>
                </div>
             </div>
          </div>
          <p className="text-xs text-gray-400 mt-6 text-center">Click any segment to auto-filter the RAG Performance Matrix and Escalation Matrix below.</p>
        </CardContent>
      </Card>

      {/* 3. Re-Eval and To-Do */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Re-Evaluation Queue (Takes 2 columns on large screens) */}
        <Card className="border-rose-100 shadow-sm bg-white lg:col-span-2">
          <CardHeader className="bg-rose-50/50 border-b border-rose-100 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-md"><RotateCcw className="h-4 w-4" /></div>
              Re-Evaluation Queue
            </CardTitle>
            <CardDescription>
              Staff who failed to follow SOPs in their first AI chat and require a retake.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {[
                { name: "Sarah Jenkins", role: "ICU Nurse", scenario: "Code Blue", date: "Oct 24" },
                { name: "Dr. Ahmed Khan", role: "Cardiology", scenario: "Angry Patient", date: "Oct 22" },
                { name: "Maria Lopez", role: "Emergency", scenario: "Routine Checkup", date: "Oct 21" }
              ].map((staff, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs uppercase">
                        {staff.name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-gray-900">{staff.name}</p>
                       <p className="text-xs text-gray-500">{staff.role} • Failed {staff.scenario}</p>
                     </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-200 shadow-none border-none pointer-events-none">Retake Needed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* To-Do List */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-100 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 bg-gray-200 text-gray-700 rounded-md"><CalendarDays className="h-4 w-4" /></div>
              Upcoming & To-Do
            </CardTitle>
            <CardDescription>
              Assessments taking place in the future.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-100">
              {[
                { module: "Annual HIPAA Recertification", dept: "All Staff", date: "Starts Nov 1" },
                { module: "New Defibrillator Models", dept: "Emergency & ICU", date: "Starts Nov 15" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{item.module}</p>
                    <p className="text-xs text-gray-500">Target: {item.dept}</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none w-fit text-[10px]">
                    {item.date}
                  </Badge>
                </div>
              ))}
              <div className="p-4 text-center text-sm flex items-center justify-center">
                 <button className="text-[#2d87a4] hover:text-[#236b82] font-medium text-sm transition-colors decoration-1 hover:underline">View All Upcoming Schedules</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
