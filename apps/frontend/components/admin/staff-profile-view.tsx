"use client";

import React, { useState, useMemo } from "react";
import { 
  CheckCircle, Clock, AlertTriangle, Globe, MessageSquare, Bell, 
  ChevronRight, User, Send, FileText, Search, Filter
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STAFF_DATA = [
  {
    id: "EMP-04821",
    initials: "PS",
    name: "Priya Sharma",
    role: "Senior ICU Nurse",
    branch: "Jaipur Main Campus",
    dept: "ICU Wing",
    lang: "Hindi / English",
    overallScore: 85,
    assigned: 4,
    overdue: 1,
    scenarios: [
      { id: 1, name: "Emergency Admission SOP", status: "completed", score: 92, date: "Mar 14, 2026", language: "English", difficulty: "Advanced", unit: "ICU Triage" },
      { id: 2, name: "Angry Patient De-escalation", status: "in-progress", elapsed: "18 mins", language: "Hindi", voiceActive: true, difficulty: "Moderate", unit: "General Wards" },
      { id: 3, name: "Infection Control Protocols", status: "overdue", daysOverdue: 10, language: "Hindi", difficulty: "Mandatory", unit: "All Staff" },
    ],
    timeline: [
      { date: "Mar 19, 2026 · 09:12", event: `System escalated "Infection Control" to Unit Manager`, type: "red" },
      { date: "Mar 14, 2026 · 14:30", event: `Voice Agent call completed for "Emergency Admission SOP"`, type: "green" },
      { date: "Mar 12, 2026 · 08:00", event: "Warning email automatically sent for 2 pending assessments", type: "amber" },
      { date: "Mar 01, 2026 · 10:00", event: "Onboarded & scenarios assigned.", type: "gray" },
    ],
    langPerf: [
      { lang: "English", completed: 1, avgScore: 92, avgTime: "14 mins" },
      { lang: "Hindi", completed: 1, avgScore: 88, avgTime: "18 mins" },
    ]
  },
  {
    id: "EMP-09231",
    initials: "MC",
    name: "Michael Chang",
    role: "Pediatric Attending",
    branch: "Mumbai Central",
    dept: "Pediatrics",
    lang: "English / Mandarin",
    overallScore: 94,
    assigned: 5,
    overdue: 0,
    scenarios: [
      { id: 4, name: "Pediatric Advanced Life Support", status: "completed", score: 96, date: "Mar 10, 2026", language: "English", difficulty: "Expert", unit: "NICU/PICU" },
      { id: 5, name: "Newborn Screening Protocol", status: "completed", score: 92, date: "Mar 05, 2026", language: "English", difficulty: "Advanced", unit: "Pediatrics" },
    ],
    timeline: [
      { date: "Mar 10, 2026 · 11:45", event: `Completed "PALS Certification" with High Distinction`, type: "green" },
      { date: "Mar 05, 2026 · 09:00", event: `Scenario "Newborn Screening" passed`, type: "green" },
    ],
    langPerf: [
      { lang: "English", completed: 2, avgScore: 94, avgTime: "12 mins" },
    ]
  },
  {
    id: "EMP-05512",
    initials: "AD",
    name: "Alisha Davis",
    role: "ER Technician",
    branch: "Delhi North",
    dept: "Emergency (ER)",
    lang: "English / Spanish",
    overallScore: 68,
    assigned: 3,
    overdue: 2,
    scenarios: [
      { id: 6, name: "Trauma Room Hygiene", status: "overdue", daysOverdue: 5, language: "English", difficulty: "Mandatory", unit: "Emergency" },
      { id: 7, name: "Gurney Maintenance", status: "overdue", daysOverdue: 12, language: "English", difficulty: "Basic", unit: "Logistics" },
    ],
    timeline: [
      { date: "Mar 18, 2026 · 16:20", event: "Final notice for overdue Trauma Hygiene assessment", type: "red" },
      { date: "Mar 10, 2026 · 10:00", event: "Assessments assigned. No activity detected.", type: "amber" },
    ],
    langPerf: [
      { lang: "English", completed: 0, avgScore: 0, avgTime: "N/A" },
    ]
  }
];

const PARAMETER_PERFORMANCE = {
  totalScore: 52,
  maxTotal: 60,
  metrics: [
    { name: "Closure", score: "N/A", max: "N/A", progress: 0, color: "bg-slate-200", text: "The audio cuts off while the staff is still in the process of negotiating the 2-minute wait and moving the patient to the lounge.", isError: true },
    { name: "Empathy", score: 8, max: 10, progress: 80, color: "bg-emerald-500", text: "The staff validated the patient's frustration and apologized sincerely, though the initial response from the first staff member was slightly repetitive." },
    { name: "Kindness", score: 9, max: 10, progress: 90, color: "bg-emerald-500", text: "The staff remained polite and respectful even when the patient was aggressive and dismissive of their explanations." },
    { name: "How To Say No", score: 8, max: 10, progress: 80, color: "bg-emerald-500", text: "The staff handled the refund demand well by acknowledging the patient's right to it but prioritizing the medical consultation first, though a clearer explanation of refund policy could have been provided." },
    { name: "Active Listening", score: 9, max: 10, progress: 90, color: "bg-emerald-500", text: "The staff accurately identified the specific doctor (Dr. Sharma) and addressed the patient's specific demand for a refund by redirecting to clinical priority." },
    { name: "Situation Handling", score: 9, max: 10, progress: 90, color: "bg-emerald-500", text: "Excellent proactive problem-solving by suggesting the OT lounge for the consultation to minimize further delay, effectively moving the patient out of the public waiting area." },
    { name: "Communication Clarity", score: 9, max: 10, progress: 90, color: "bg-emerald-500", text: "The second staff member followed the mandatory greeting protocol ('Namaste' and name introduction). Language was clear and professional throughout." },
  ]
};

function nodeStyle(type: string) {
  if (type === "red")   return { dot: "bg-red-500 border-red-300", line: "border-red-200", text: "text-red-700" };
  if (type === "green") return { dot: "bg-emerald-500 border-emerald-300", line: "border-emerald-200", text: "text-emerald-700" };
  if (type === "amber") return { dot: "bg-amber-500 border-amber-300", line: "border-amber-200", text: "text-amber-700" };
  return { dot: "bg-slate-400 border-slate-300", line: "border-slate-200", text: "text-slate-500" };
}

export function StaffProfileView() {
  const searchParams = useSearchParams();
  const staffParam = searchParams.get("staff");

  // Sort by performance and pick top one as default if no staff selected
  const sortedStaff = useMemo(() => [...STAFF_DATA].sort((a, b) => b.overallScore - a.overallScore), []);
  
  const selectedId = staffParam || sortedStaff[0]?.id || "";
  const staff = useMemo(() => STAFF_DATA.find(s => s.id === selectedId) || sortedStaff[0] || STAFF_DATA[0], [selectedId, sortedStaff]);

  if (!staff) return null; // Defensive check for TS

  return (
    <div className="space-y-5">

      {/* STAFF SELECTOR / FILTER BAR REMOVED */}

      {/* TOP: Staff Master Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 animate-in slide-in-from-top-2 duration-300">
        <div className="flex flex-col xl:flex-row xl:items-center gap-5">
          
          {/* Left: Identity */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-14 w-14 rounded-lg bg-[#e8f4f8] border border-[#bde0ec] flex items-center justify-center text-[18px] font-bold text-[#2d87a4] shrink-0">
              {staff.initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-slate-900 truncate">{staff.name}</h2>
              <p className="text-[12px] text-slate-500 font-medium">{staff.role} · ID: {staff.id}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{staff.branch} · Dept: {staff.dept}</p>
            </div>
          </div>

          {/* Middle: Language */}
          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-lg shrink-0">
            <Globe className="h-4 w-4 text-indigo-500" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">Preferred Lang.</p>
              <p className="text-[13px] font-bold text-indigo-800">{staff.lang}</p>
            </div>
          </div>

          {/* Right: KPIs */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center px-4 py-2 border-r border-slate-200">
              <p className={`text-2xl font-bold leading-none ${staff.overallScore >= 85 ? 'text-emerald-600' : staff.overallScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{staff.overallScore}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1">Overall</p>
            </div>
            <div className="text-center px-4 py-2 border-r border-slate-200">
              <p className="text-2xl font-bold text-slate-800 leading-none">{staff.assigned}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1">Assigned</p>
            </div>
            <div className="text-center px-4 py-2 min-w-[100px]">
              {staff.overdue > 0 ? (
                <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-[12px] font-bold px-2.5 py-1 rounded-full">
                  <AlertTriangle className="h-3 w-3" /> {staff.overdue} Overdue
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" /> All Status Ok
                </div>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-2">Compliance</p>
            </div>
          </div>

        </div>
      </div>

      {/* FULL-WIDTH: Scenario Portfolio */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <h3 className="text-[14px] font-semibold text-slate-800">Assigned Scenarios & Protocols</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{staff.scenarios.length} Scenarios</span>
          </div>

          <div className="divide-y divide-slate-100">
            {staff.scenarios.map((s) => (
              <div key={s.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                      s.status === "completed"   ? "bg-emerald-50"  :
                      s.status === "in-progress" ? "bg-blue-50"     : "bg-red-50"
                    }`}>
                      {s.status === "completed"   && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      {s.status === "in-progress" && <Clock className="h-4 w-4 text-blue-600" />}
                      {s.status === "overdue"     && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-slate-800 truncate">{s.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
                        <span className="inline-flex text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{s.language}</span>
                        {"difficulty" in s && (
                          <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{s.difficulty}</span>
                        )}
                        {"unit" in s && (
                          <span className="text-[11px] text-slate-600 font-medium">· {s.unit}</span>
                        )}
                        {"date" in s && s.date && (
                          <span className="text-[11px] text-slate-500">· Completed {s.date}</span>
                        )}
                        {"elapsed" in s && s.elapsed && (
                          <span className="text-[11px] text-blue-600 font-medium">· {s.elapsed} elapsed</span>
                        )}
                        {"daysOverdue" in s && s.daysOverdue && (
                          <span className="text-[11px] text-red-600 font-semibold">· {s.daysOverdue} Days Overdue</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    {s.status === "completed" && (
                      <>
                        <span className="text-[15px] font-bold text-emerald-700">{s.score}% Match</span>
                        <button className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5">
                          View Detailed Transcript <ChevronRight className="h-3 w-3" />
                        </button>
                      </>
                    )}
                    {s.status === "in-progress" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Voice Engine Active
                      </span>
                    )}
                    {s.status === "overdue" && (
                      <Button size="sm" variant="outline" className="h-8 text-[11px] gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold">
                        <Send className="h-3.5 w-3.5" /> Send Manual Nudge
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* SIDE-BY-SIDE ANALYTICS: Parameter Performance & Action History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        
        {/* LEFT: PARAMETER PERFORMANCE WIDGET */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-slate-500" />
                <h3 className="text-[14px] font-semibold text-slate-800 tracking-tight">Parameter Performance</h3>
             </div>
             <div className="text-[14px] font-bold text-emerald-600">
               {PARAMETER_PERFORMANCE.totalScore} <span className="text-[11px] text-slate-400 font-medium">/ {PARAMETER_PERFORMANCE.maxTotal}</span>
             </div>
          </div>
          
          <div className="p-5 space-y-6 h-[400px] overflow-y-auto">
             {PARAMETER_PERFORMANCE.metrics.map((metric, i) => (
               <div key={i} className="flex flex-col space-y-2">
                 <div className="flex items-center justify-between">
                   <span className="text-[13px] font-bold text-slate-700">{metric.name}</span>
                   <span className={`text-[13px] font-bold ${metric.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                     {metric.score} {metric.max !== "N/A" && <span className="text-[11px] text-slate-400 font-medium">/ {metric.max}</span>}
                   </span>
                 </div>
                 
                 <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                   <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.progress}%` }} />
                 </div>
                 
                 <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                   {metric.text}
                 </p>
               </div>
             ))}
          </div>
        </div>

        {/* RIGHT: Timeline */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="text-[14px] font-semibold text-slate-800">Action History & Journey</h3>
          </div>

          <div className="p-5 flex-1 relative h-[400px] overflow-y-auto">
            <div className="relative">
              {staff.timeline.map((node, i) => {
                const s = nodeStyle(node.type);
                return (
                  <div key={i} className="flex gap-4 relative">
                    {/* Vertical line */}
                    {i < staff.timeline.length - 1 && (
                      <div className={`absolute left-[9px] top-5 bottom-0 w-px border-l-2 border-dashed ${s.line} z-0`} />
                    )}
                    {/* Dot */}
                    <div className={`relative z-10 mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 ${s.dot}`} />
                    {/* Content */}
                    <div className={`pb-6 ${i === staff.timeline.length - 1 ? 'pb-0' : ''}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${s.text}`}>{node.date}</p>
                      <p className="text-[12px] font-medium text-slate-700 leading-relaxed">{node.event}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM: Multilingual Performance Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <h3 className="text-[14px] font-semibold text-slate-800">Multilingual Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Assessment Language</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Scenarios Completed</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Average Score</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Avg. Time-to-Complete</th>
              </tr>
            </thead>
            <tbody>
              {staff.langPerf.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[13px] font-semibold text-slate-800">{row.lang}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[13px] font-semibold text-slate-700">{row.completed}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {row.completed > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[13px] font-bold text-emerald-700">{row.avgScore}%</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.avgScore}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-slate-400">No Data</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[12px] font-medium text-slate-600">{row.avgTime}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
