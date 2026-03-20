"use client";
import React, { useState } from "react";
import { 
  TrendingUp, Target, Search, Users, ShieldAlert, BookOpen, UserPlus, FileText, Lightbulb, XCircle
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

const MOCK_INSIGHTS = {
  all: {
    critical: [
      { text: "Failed to greet with 'Namaste'.", count: 45, percentage: "22%" },
      { text: "Failed to introduce self by name and designation.", count: 38, percentage: "18%" },
      { text: "Used dismissive/defensive language ('What is your problem', 'Calm down').", count: 25, percentage: "12%" },
      { text: "Failed to offer a sincere apology for the significant delay.", count: 30, percentage: "15%" },
    ],
    behavioral: [
      "The interaction frequently begins with dismissive language which escalated the patient's frustration in 30% of cases.",
      "Most staff members successfully performed an interim clinical check by offering a vitals check and proactively contacted the doctor's team.",
      "Overall empathy indicators drop significantly during high-stress scenarios involving angry families."
    ]
  },
  person: {
    critical: [
      { text: "Failed to greet with 'Namaste'." },
      { text: "Failed to introduce self by name and designation." },
      { text: "Used dismissive/defensive language ('What is your problem', 'Calm down')." },
      { text: "Failed to offer a sincere apology for the significant delay." },
    ],
    behavioral: [
      "The staff member failed to provide the mandatory 'Namaste' greeting and personal introduction.",
      "The interaction began with dismissive language ('What is your problem', 'Calm down'), which escalated the patient's frustration.",
      "The staff member successfully performed an interim clinical check by offering a vitals check and proactively contacted the doctor's team to provide a status update."
    ]
  }
};

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
  const staffParam = rawStaff && rawStaff !== "all-staff" ? rawStaff : null;

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

      {/* SECTION B: Key Insights */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 overflow-hidden">
         <div className="flex items-center gap-2 mb-6">
           <Lightbulb className="h-5 w-5 text-amber-500" />
           <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">Key Insights</h3>
         </div>
         
         <div className="bg-[#fff9f9] border border-[#fecaca] rounded-xl p-5 mb-6">
           <div className="flex items-center gap-2 mb-4 text-[#b91c1c]">
             <XCircle className="h-5 w-5" />
             <h4 className="text-[13px] font-bold uppercase tracking-wider">Critical Violations</h4>
           </div>
           
           <ul className="space-y-3">
             {selectedStaffObj ? (
                MOCK_INSIGHTS.person.critical.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[14px] text-[#991b1b] font-medium leading-relaxed">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" />
                    <span>{item.text}</span>
                  </li>
                ))
             ) : (
                MOCK_INSIGHTS.all.critical.map((item, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-[14px] text-[#991b1b] font-medium leading-relaxed group">
                    <div className="flex gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" />
                      <span>{item.text}</span>
                    </div>
                    <div className="shrink-0 flex flex-wrap items-center gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity ml-4 sm:ml-0">
                      <span className="text-[11px] bg-white border border-[#fecaca] px-2 py-0.5 rounded-full text-[#b91c1c] font-bold">{item.count} occurrences</span>
                      <span className="text-[11px] bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 rounded-full text-[#991b1b] font-bold">{item.percentage} impact</span>
                    </div>
                  </li>
                ))
             )}
           </ul>
         </div>

         <div>
           <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Behavioral Observations</h4>
           <ul className="space-y-3 px-1">
             {(selectedStaffObj ? MOCK_INSIGHTS.person.behavioral : MOCK_INSIGHTS.all.behavioral).map((obs, i) => (
               <li key={i} className="flex gap-3 text-[14px] text-slate-700 font-medium leading-relaxed">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <span>{obs}</span>
               </li>
             ))}
           </ul>
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
