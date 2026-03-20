"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Lightbulb, FileText, CheckCircle2, Award, Route, XCircle, TrendingUp, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface AssessmentReportPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: any | null;
}

export function AssessmentReportPopup({ open, onOpenChange, staff }: AssessmentReportPopupProps) {
  if (!staff) return null;

  // Assuming data structure based on the CohortCompletionTracker mock data
  const mainScenario = staff.scenarios?.[0] || "General Assessment";
  const score = staff.score && staff.score !== "--" ? parseInt(staff.score) : staff.status === "Completed" ? 85 : 0;
  
  const handleDownloadPdf = () => {
     const t = toast.loading("Generating PDF report...");
     setTimeout(() => {
        toast.success("PDF Downloaded successfully!", { id: t });
     }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-slate-50">
        
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 shadow-sm z-10">
           <div className="flex justify-between items-start mb-1">
             <div>
                <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
                  {staff.name}
                </DialogTitle>
                <p className="text-[14px] text-slate-500 mt-1 font-medium">
                  {staff.role} • {staff.id}
                </p>
             </div>
             <div className="flex items-center gap-6">
                {/* Download Button visible only when completed */}
                {staff.status === "Completed" && (
                   <Button 
                      onClick={handleDownloadPdf}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9 gap-2 text-[12px] font-semibold"
                   >
                     <Download className="h-4 w-4" />
                     Download PDF
                   </Button>
                )}
                
                <div className="flex flex-col items-end">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                     {staff.status === "Completed" ? "Final Overall Score" : "Current Score"}
                  </span>
                  <div className={`flex items-baseline gap-1 ${score >= 85 ? 'text-emerald-600' : score > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                     <span className="text-4xl font-black">{score > 0 ? score : "--"}</span>
                     <span className="text-sm font-bold">{score > 0 ? "%" : ""}</span>
                  </div>
                </div>
             </div>
           </div>
           
           <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 px-3 py-1.5 rounded-md">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span className="text-[13px] font-semibold text-indigo-800">
                 Scenario: {mainScenario}
              </span>
           </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
           
           {/* === SECTION 1: Assessment Journey Timeline === */}
           <section>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                 <Route className="h-4 w-4 text-indigo-400" />
                 Assessment Journey & Progression
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                 <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                    {/* Event 1 */}
                    <div className="relative pl-6">
                       <span className="absolute -left-[11px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 ring-4 ring-white">
                          <CheckCircle2 className="h-3 w-3 text-slate-500" />
                       </span>
                       <h4 className="text-[13px] font-semibold text-slate-800">Enrolled & Assigned</h4>
                       <p className="text-[12px] text-slate-500 mt-1">Assigned to the {mainScenario} cohort group for foundational compliance training.</p>
                       <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Day 1</span>
                    </div>

                    {/* Event 2 */}
                    <div className="relative pl-6">
                       <span className="absolute -left-[11px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 ring-4 ring-white">
                          <XCircle className="h-3 w-3 text-rose-600" />
                       </span>
                       <h4 className="text-[13px] font-semibold text-rose-700">Initial Attempt Failed (Score: 42%)</h4>
                       <p className="text-[12px] text-slate-600 mt-1">Struggled significantly with active listening and closure. Displayed defensive behavior when patient escalated the situation.</p>
                       <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Day 4</span>
                    </div>

                    {/* Event 3 */}
                    <div className="relative pl-6">
                       <span className="absolute -left-[11px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                          <TrendingUp className="h-3 w-3 text-blue-600" />
                       </span>
                       <h4 className="text-[13px] font-semibold text-blue-700">Feedback Review & Re-Assigned</h4>
                       <p className="text-[12px] text-slate-600 mt-1">Completed targeted review on "How to say no" gracefully without escalating patient anxiety.</p>
                       <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Day 5</span>
                    </div>

                    {/* Event 4 */}
                    <div className="relative pl-6">
                       <span className="absolute -left-[11px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-white">
                          <Award className="h-3 w-3 text-emerald-600" />
                       </span>
                       <h4 className="text-[13px] font-semibold text-emerald-700">Validated & Passed (Score: {score}%)</h4>
                       <p className="text-[12px] text-slate-600 mt-1">Huge improvement in communication clarity and situation handling. Successfully de-escalated the scenario and achieved compliance.</p>
                       <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Day 7</span>
                    </div>
                 </div>
              </div>
           </section>
           
           {/* === SECTION 2: Deep Dive Analytics (Side-by-side) === */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Left Column: Parameters */}
               <section className="space-y-4">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                     <Award className="h-4 w-4 text-slate-400" />
                     Parameter Performance
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                     {[
                        { label: "Closure", val: 88, color: "bg-emerald-500" },
                        { label: "Empathy", val: 92, color: "bg-emerald-400" },
                        { label: "Kindness", val: 95, color: "bg-emerald-300" },
                        { label: "How to say no", val: 76, color: "bg-amber-400" },
                        { label: "Active listening", val: 82, color: "bg-emerald-600" },
                        { label: "Situation handling", val: 85, color: "bg-emerald-500" },
                        { label: "Communication clarity", val: 70, color: "bg-amber-500" },
                     ].map(param => (
                        <div key={param.label} className="w-full">
                           <div className="flex justify-between items-end mb-1.5">
                              <span className="text-[12px] font-semibold text-slate-700">{param.label}</span>
                              <span className="text-[12px] font-bold text-slate-900">{param.val}%</span>
                           </div>
                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${param.color} rounded-full`} style={{ width: `${param.val}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Right Column: Violations, Insights, SOP */}
               <div className="space-y-6">
                  {/* Red Flags / Violations */}
                  <section>
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        Remaining Red Flags
                    </h3>
                    <div className="bg-white border border-rose-100 rounded-xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-slate-50">
                          <li className="px-4 py-3 flex gap-3 items-start hover:bg-slate-50 transition-colors">
                              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[11px] font-black">!</span>
                              </span>
                              <div>
                                <p className="text-[13px] font-semibold text-slate-800">Hesitancy in policy enforcement</p>
                                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">Even though passed, the user still took too long (3+ minutes) to firmly state the hospital policy.</p>
                              </div>
                          </li>
                        </ul>
                    </div>
                  </section>

                  {/* SOP Adherence */}
                  <section>
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        SOP Adherence Analysis
                    </h3>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[13px] font-semibold text-slate-700">Protocol Match</span>
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-bold">{score + 5}%</Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="text-[12px] text-slate-600 font-medium">Verified patient identity using 2 identifiers</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="text-[12px] text-slate-600 font-medium">De-escalated voice tone successfully</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-60">
                              <div className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0" />
                              <span className="text-[12px] text-slate-500 font-medium line-through">Provided immediate follow-up timeline</span>
                          </div>
                        </div>
                    </div>
                  </section>
                  
                  {/* Key Insights */}
                  <section className="pb-4">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Behavioral Observations
                    </h3>
                    <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 shadow-sm">
                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                          The staff member demonstrated excellent domain knowledge and maintained a calm demeanor during the anxious patient phase. Empathy was extremely high. However, their ability to "say no" was slightly weak, leading to communication clarity drops. Recommended to focus on firm but polite assertions in future scenarios.
                        </p>
                    </div>
                  </section>
               </div>
           </div>
           
        </div>
      </DialogContent>
    </Dialog>
  );
}
