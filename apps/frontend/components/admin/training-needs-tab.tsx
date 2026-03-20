"use client";
import React, { useState } from "react";
import { 
  TrendingUp, Target, Search, Users, ShieldAlert, BookOpen, UserPlus, FileText
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { StaffProficiencySheet } from "@/components/admin/staff-proficiency-sheet";
import { KpiCardUnified } from "./kpi-card-unified";

const MATRIX_DATA = [
  { id: "EMP-04821", name: "Priya Sharma", role: "Senior ICU Nurse", dept: "ICU Wing", score: 85, rec: "Advanced Protocols", skills: [82, 90, 85, 88] },
  { id: "EMP-09231", name: "Michael Chang", role: "Pediatric Attending", dept: "Pediatrics", score: 94, rec: "No Action Reqd.", skills: [94, 98, 92, 90] },
  { id: "EMP-05512", name: "Alisha Davis", role: "ER Technician", dept: "Emergency (ER)", score: 68, rec: "SOP Compliance Module", skills: [60, 75, 55, 80] },
  { id: "EMP-01124", name: "Robert Jones", role: "Emergency RN", dept: "Emergency (ER)", score: 77, rec: "De-escalation Module", skills: [65, 92, 45, 88] },
  { id: "EMP-03882", name: "Lisa Smith", role: "Admin Staff", dept: "Front Desk", score: 70, rec: "Billing Escalations", skills: [82, 40, 55, 95] },
  { id: "EMP-06771", name: "Tom Kumar", role: "Nurse Grade I", dept: "Emergency (ER)", score: 62, rec: "Mandatory Patient Safety", skills: [55, 70, 40, 80] },
];

const SKILLS_LABELS = ["Patient Safety", "Clinical Protocols", "SOP Compliance", "Data Security"];

const GAPS_DATA = [
  { name: "Data Security", score: 95 },
  { name: "Patient Safety", score: 91 },
  { name: "Clinical Protocols", score: 84 },
  { name: "SOP Compliance", score: 62 },
];

function getHeatmapSquare(score: number) {
  if (score >= 85) return "bg-[#34d399] border-[#059669]"; // Muted Emerald
  if (score >= 65) return "bg-[#fbbf24] border-[#d97706]"; // Muted Amber
  return "bg-[#ef4444] border-[#b91c1c]"; // Muted Red
}

function getScoreBadge(score: number) {
  if (score >= 85) return 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]';
  if (score >= 65) return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]';
  return 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]';
}

export function TrainingNeedsTab() {
  const [selectedRecord, setSelectedRecord] = useState<typeof MATRIX_DATA[0] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const rawStaff = searchParams.get("staff");
  const staffParam = rawStaff && rawStaff !== "all-staff" ? rawStaff : (!rawStaff ? "EMP-09231" : null);

  const isSpecificStaff = !!staffParam;
  const selectedStaffObj = isSpecificStaff ? MATRIX_DATA.find(m => m.id === staffParam) : null;

  function handleRowClick(row: typeof MATRIX_DATA[0]) {
    setSelectedRecord(row);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-6">
      <StaffProficiencySheet record={selectedRecord} open={sheetOpen} onOpenChange={setSheetOpen} />
      
      {/* SECTION A: Executive Summary KPI Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Overall Proficiency */}
        <KpiCardUnified
          label="Overall Proficiency"
          value="78%"
          sub={
            <span className="text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> 2.4% from target
            </span>
          }
          icon={<Target className="h-4 w-4" />}
          iconColor="text-slate-400"
        />

        {/* KPI 2: Top Priority Area */}
        <KpiCardUnified
          label="Top Priority Area"
          value="SOP Compliance"
          sub={<span className="text-amber-600 font-semibold">62% Avg across units</span>}
          icon={<ShieldAlert className="h-4 w-4" />}
          iconColor="text-amber-500"
        />

        {/* KPI 3: Critical Training Needed */}
        <KpiCardUnified
          label="Critical Training Needed"
          value="27"
          sub={<span className="text-red-600 font-semibold">Staff Below 65% threshold</span>}
          icon={<Users className="h-4 w-4" />}
          iconColor="text-red-400"
          accentBorder="border-l-2 border-l-red-500"
        />

        {/* KPI 4: Completed Trainings */}
        <KpiCardUnified
          label="Completed Trainings"
          value="150"
          sub="Verified in last 30 days"
          icon={<BookOpen className="h-4 w-4" />}
          iconColor="text-slate-400"
        />

      </div>

      {/* SECTION B: Dynamic Strengths & Competency Gaps Analysis */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-0 overflow-hidden">
         <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <h3 className="text-[15px] font-semibold text-slate-800">
             {selectedStaffObj ? `Proficiency Insights: ${selectedStaffObj.name}` : 'Organization-Wide Competency Overview'}
           </h3>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
           
           {/* Top Strengths */}
           <div className="p-6 bg-white">
             <div className="flex items-center gap-2 mb-4 text-emerald-600">
               <TrendingUp className="h-5 w-5" />
               <h4 className="text-[14px] font-bold">Top Strengths</h4>
             </div>
             
             <div className="space-y-4">
               {(() => {
                 const data: { name: string; score: number }[] = selectedStaffObj ? [
                   { name: "Patient Safety", score: selectedStaffObj.skills[0] ?? 0 },
                   { name: "Clinical Protocols", score: selectedStaffObj.skills[1] ?? 0 },
                   { name: "SOP Compliance", score: selectedStaffObj.skills[2] ?? 0 },
                   { name: "Data Security", score: selectedStaffObj.skills[3] ?? 0 },
                 ] : GAPS_DATA;
                 const strengths = [...data].sort((a,b) => b.score - a.score).slice(0, 2);
                 return strengths.map((item, i) => (
                   <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-emerald-100 bg-emerald-50/30">
                     <span className="text-[13px] font-semibold text-emerald-800">{item.name}</span>
                     <span className="text-[14px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded shadow-sm border border-emerald-100">{item.score}%</span>
                   </div>
                 ));
               })()}
             </div>
             <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
               {selectedStaffObj 
                 ? `${selectedStaffObj.name} demonstrates excellent capabilities in these areas, consistently performing above the 85% benchmark.`
                 : "Across all departments, these protocols represent our strongest compliance areas."}
             </p>
           </div>
           
           {/* Key Shortcomings / Areas for Improvement */}
           <div className="p-6 bg-white">
             <div className="flex items-center gap-2 mb-4 text-amber-600">
               <ShieldAlert className="h-5 w-5" />
               <h4 className="text-[14px] font-bold">Priority Areas for Improvement</h4>
             </div>
             
             <div className="space-y-4">
               {(() => {
                 const data: { name: string; score: number }[] = selectedStaffObj ? [
                   { name: "Patient Safety", score: selectedStaffObj.skills[0] ?? 0 },
                   { name: "Clinical Protocols", score: selectedStaffObj.skills[1] ?? 0 },
                   { name: "SOP Compliance", score: selectedStaffObj.skills[2] ?? 0 },
                   { name: "Data Security", score: selectedStaffObj.skills[3] ?? 0 },
                 ] : GAPS_DATA;
                 const weaknesses = [...data].sort((a,b) => a.score - b.score).slice(0, 2); // get lowest 2
                 return weaknesses.map((item, i) => (
                   <div key={i} className="flex flex-col gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50">
                     <div className="flex justify-between items-center">
                       <span className="text-[13px] font-bold text-amber-900">{item.name}</span>
                       <span className={`text-[13px] font-bold px-2 py-0.5 rounded shadow-sm border ${item.score < 65 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-amber-600 border-amber-200'}`}>
                         {item.score}%
                       </span>
                     </div>
                     <div className="w-full bg-amber-200/50 rounded-full h-1.5 overflow-hidden">
                       <div className={`h-1.5 rounded-full ${item.score < 65 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${item.score}%` }}></div>
                     </div>
                   </div>
                 ));
               })()}
             </div>
             <p className="text-[11px] text-slate-600 mt-4 font-medium">
               Target Benchmark: <span className="font-bold text-red-500">75%</span>
             </p>
           </div>
         </div>
      </div>


      {/* SECTION C: Detailed Staff Training Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
         
         {/* Table Header & Filters */}
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-[15px] font-semibold text-slate-800">Staff Proficiency Matrix & Recommendations</h3>
            
            <div className="flex flex-wrap items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                 <Input 
                   type="text" 
                   placeholder="Search Staff Name/ID..." 
                   className="pl-8 h-8 w-[160px] sm:w-[200px] text-[12px] bg-white border-slate-200 shadow-sm"
                 />
               </div>
               
               <Select defaultValue="all-skills">
                 <SelectTrigger className="h-8 w-[130px] text-[12px] bg-white shadow-sm border-slate-200">
                   <SelectValue placeholder="Select Skill" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all-skills">All Skills</SelectItem>
                   <SelectItem value="patient-safety">Patient Safety</SelectItem>
                   <SelectItem value="sop">SOP Compliance</SelectItem>
                 </SelectContent>
               </Select>

               <Select defaultValue="all-levels">
                 <SelectTrigger className="h-8 w-[130px] text-[12px] bg-white shadow-sm border-slate-200">
                   <SelectValue placeholder="Proficiency" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all-levels">All Levels</SelectItem>
                   <SelectItem value="strong">Strong (&gt;85%)</SelectItem>
                   <SelectItem value="marginal">Marginal (65-85%)</SelectItem>
                   <SelectItem value="critical">Critical (&lt;65%)</SelectItem>
                 </SelectContent>
               </Select>
            </div>
         </div>

         {/* Data Dense Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 sticky left-0 bg-[#f8fafc] z-10 w-[220px]">Staff Profile</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Dept / Unit</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Score</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Recommended Training</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {MATRIX_DATA.map((row) => (
                  <tr key={row.id} onClick={() => handleRowClick(row)} className="hover:bg-indigo-50/40 cursor-pointer transition-colors border-b border-slate-100 last:border-none group">
                    {/* Staff Profile */}
                    <td className="px-4 py-2.5 sticky left-0 bg-white group-hover:bg-indigo-50/40 z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600 shrink-0">
                          {row.id}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 leading-tight">{row.name}</span>
                          <span className="text-[10px] text-slate-500">{row.role}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Dept */}
                    <td className="px-4 py-2.5 text-slate-600 font-medium">{row.dept}</td>
                    
                    {/* Score */}
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold border ${getScoreBadge(row.score)}`}>
                        {row.score}%
                      </span>
                    </td>
                    
                    {/* Recommendation */}
                    <td className="px-4 py-2.5">
                      <div className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded truncate max-w-[150px]">
                        {row.rec}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Assign Module">
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-800 hover:bg-slate-100" title="View Profile">
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
