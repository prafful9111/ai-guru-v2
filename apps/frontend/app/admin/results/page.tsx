"use client";

import React, { Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { RagPerformanceMatrix } from "@/components/admin/rag-performance-matrix";
import { CommandCenterHeader } from "@/components/admin/command-center-header";
import { KpiCardUnified } from "@/components/admin/kpi-card-unified";
import { QuickInsights } from "@/components/admin/quick-insights";
import { BarChart2, FileText, CheckCircle, TrendingUp, AlertCircle, AlertTriangle } from "lucide-react";

const SCORE_DIST = [
  { label: "Green (SOP Masters)", range: "≥ 85%", count: 34, pct: 56, color: "bg-emerald-500", textColor: "text-emerald-700" },
  { label: "Amber (Developing)", range: "65–84%", count: 18, pct: 30, color: "bg-amber-400", textColor: "text-amber-700" },
  { label: "Red (High Risk)", range: "< 65%", count: 8, pct: 14, color: "bg-red-500", textColor: "text-red-700" },
];

export default function AssessmentResults() {
  const router = useRouter();
  const { signout } = useAuth();

  const handleLogout = () => {
    signout();
    router.push("/auth/login");
  };

  return (
    <AdminLayoutShell>
      <AdminHeader 
        handleLogout={handleLogout} 
        title="Assessment Results" 
        description="Review staff SOP readiness, drill down into transcripts, and manage re-attempts." 
      />
      
      <main className="w-full mx-auto pb-12">
        <CommandCenterHeader />
        
        <div className="px-4 md:px-8 animate-in fade-in duration-500">
           <div className="space-y-6">
             
             {/* 1. KPI Cards Row (2 rows of 3) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <KpiCardUnified
                 label="Total Assessments"
                 value="1,284"
                 sub="Overall platform volume"
                 icon={<FileText className="h-4 w-4" />}
                 iconColor="text-blue-600"
               />
               <KpiCardUnified
                 label="Pass Rate (Green)"
                 value="94.2%"
                 sub={<span className="text-emerald-600 font-medium">Above target thresholds</span>}
                 icon={<CheckCircle className="h-4 w-4" />}
                 iconColor="text-emerald-600"
               />
               <KpiCardUnified
                 label="Avg. Proficiency"
                 value="88%"
                 sub={<span className="text-indigo-600 font-medium">+2.4% from last month</span>}
                 icon={<TrendingUp className="h-4 w-4" />}
                 iconColor="text-indigo-600"
               />
               <KpiCardUnified
                 label="SOP Masters"
                 value={SCORE_DIST[0]!.count}
                 sub="Exceeding clinical standards"
                 icon={<CheckCircle className="h-4 w-4" />}
                 iconColor="text-emerald-600"
               />
               <KpiCardUnified
                 label="Developing"
                 value={SCORE_DIST[1]!.count}
                 sub="Require marginal focus"
                 icon={<AlertCircle className="h-4 w-4" />}
                 iconColor="text-amber-600"
               />
               <KpiCardUnified
                 label="High Risk"
                 value={SCORE_DIST[2]!.count}
                 sub={<span className="text-red-600 font-medium">Critical intervention needed</span>}
                 icon={<AlertTriangle className="h-4 w-4" />}
                 iconColor="text-red-600"
                 accentBorder="border-l-2 border-l-red-400"
               />
             </div>

             {/* 2. Quick Insights (Detailed S/W/Retake) */}
             <Suspense fallback={<div className="h-32 flex items-center justify-center text-slate-400">Loading insights...</div>}>
               <QuickInsights />
             </Suspense>

             {/* 3. The Table (RAG Performance Matrix) */}
             <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading matrix...</div>}>
                 <RagPerformanceMatrix />
               </Suspense>
             </div>
             
             {/* 4. Last RAG Score Distribution */}
             <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
               <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                 <BarChart2 className="h-4 w-4 text-slate-500" />
                 <h3 className="text-[14px] font-semibold text-slate-800">RAG Score Distribution</h3>
                 <span className="ml-auto text-[11px] text-slate-400 font-medium">60 Staff · Current Cycle</span>
               </div>
               <div className="p-5 space-y-5">
                 {/* Visual stacked bar */}
                 <div className="flex h-4 w-full rounded overflow-hidden gap-0.5">
                   {SCORE_DIST.map((s, i) => (
                     <div key={i} className={`${s.color} transition-all`} style={{ width: `${s.pct}%` }} title={`${s.label}: ${s.count} staff`} />
                   ))}
                 </div>
                 {/* Table breakdown */}
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr>
                       <th className="pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Category</th>
                       <th className="pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Score Range</th>
                       <th className="pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-center">Staff Count</th>
                       <th className="pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-40">% of Cohort</th>
                     </tr>
                   </thead>
                   <tbody>
                     {SCORE_DIST.map((s, i) => (
                       <tr key={i} className="border-t border-slate-100">
                         <td className="py-2.5">
                           <span className={`text-[12px] font-semibold ${s.textColor}`}>{s.label}</span>
                         </td>
                         <td className="py-2.5 text-[12px] font-medium text-slate-600">{s.range}</td>
                         <td className="py-2.5 text-center text-[13px] font-bold text-slate-800">{s.count}</td>
                         <td className="py-2.5">
                           <div className="flex items-center gap-2">
                             <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                             </div>
                             <span className="text-[11px] font-semibold text-slate-600 w-8 text-right">{s.pct}%</span>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
        </div>
      </main>
    </AdminLayoutShell>
  );
}
