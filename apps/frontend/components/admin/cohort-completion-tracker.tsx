"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AssessmentReportPopup } from "@/components/admin/assessment-report-popup";

const ScenarioCell = ({ scenarios }: { scenarios: string[] }) => {
   if (!scenarios || scenarios.length === 0 || !scenarios[0]) return <span className="text-gray-400 text-xs italic">Unassigned</span>;

   const firstScenario = scenarios[0];

   return (
     <div className="relative flex items-center gap-1.5 min-w-[120px] group/badge w-fit">
       <span 
          className="text-[11px] truncate max-w-[140px] bg-indigo-50/50 text-indigo-700 px-2 py-1 rounded font-medium border border-indigo-100/50"
          title={firstScenario}
       >
          {firstScenario.split(' (')[0]}
       </span>
       
       {scenarios.length > 1 && (
         <div className="relative">
           <Badge 
             variant="outline" 
             className="cursor-default hover:bg-slate-100 bg-white shadow-sm text-[10px] px-1.5 py-0 h-5"
           >
             +{scenarios.length - 1}
           </Badge>

           {/* Hover Popover */}
           <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] p-3 bg-white border border-slate-200 shadow-xl rounded-xl z-[60] opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                <h4 className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">All Assigned Modules</h4>
             </div>
             <ul className="text-[12px] space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
               {scenarios.map((s, i) => (
                 <li key={i} className="bg-slate-50/80 border border-slate-100 p-2 rounded-lg text-slate-700 font-medium leading-snug">
                    {s}
                 </li>
               ))}
             </ul>
           </div>
         </div>
       )}
     </div>
   );
};

const MOCK_COHORT = [
  { id: "EMP-09231", name: "Michael Chang", dept: "emergency", role: "ER Nurse", scenarios: ["Delayed doctor appointment", "Calming an anxious patient"], progress: 80, status: "In Progress", score: "92%" },
  
  { id: "EMP-04821", name: "Priya Sharma", dept: "cardiology", role: "Cardiologist", scenarios: ["Outside food request"], progress: 100, status: "Completed", score: "88%" },
  
  { id: "EMP-05512", name: "Alisha Davis", dept: "emergency", role: "Radiology Tech", scenarios: ["Angry patient overcharged", "Breaking a bad news", "Cold and late food"], progress: 33, status: "Overdue", score: "96%" },
  
  { id: "EMP-01124", name: "Robert Jones", dept: "icu", role: "Pediatrics", scenarios: ["Out of visiting hours"], progress: 40, status: "In Progress", score: "--" },
  
  { id: "EMP-06771", name: "Tom Kumar", dept: "cardiology", role: "Surgical Tech", scenarios: ["Delayed doctor appointment"], progress: 100, status: "Completed", score: "74%" },
];

interface Props {
  filterBatch?: string;
  filterStaff?: string;
  filterDept?: string;
}

export function CohortCompletionTracker({ filterBatch = "all-batches", filterStaff = "all-staff", filterDept = "all-dept" }: Props) {
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Deterministically "filter" the mock data so it visually reacts to batch changes
  let displayCohort = MOCK_COHORT;
  
  if (filterBatch === "individual" && filterStaff === "all-staff") {
      displayCohort = [];
  } else if (filterStaff !== "all-staff") {
      displayCohort = MOCK_COHORT.filter(s => s.id === filterStaff);
  } else if (filterDept !== "all-dept") {
      displayCohort = MOCK_COHORT.filter(s => s.dept === filterDept);
  } else if (filterBatch !== "all-batches") {
    const num = filterBatch.length % 3;
    if (num === 0) displayCohort = MOCK_COHORT.slice(0, 4);
    else if (num === 1) displayCohort = MOCK_COHORT.slice(3, 7);
    else displayCohort = MOCK_COHORT.slice(1, 6);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-800">Staff Progress Tracker</h3>
          <p className="text-[12px] text-slate-500">Individual progress and results for the selected group</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Search cohort..." 
            className="h-8 pl-8 text-[12px] bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Staff Member</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Assigned Scenario</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-48">Progress</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">Latest Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayCohort.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-12 text-center">
                      <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-[13px] font-medium text-slate-500">No staff member selected.</p>
                      <p className="text-[12px] text-slate-400 mt-1">Please select a Staff Member from the global filters above to view individual progress.</p>
                   </td>
                </tr>
             ) : displayCohort.map((staff, idx) => {
               let BadgeIcon = Clock;
               let badgeStyle = "bg-slate-100 text-slate-600";
               let barColor = "bg-slate-300";
               
               if (staff.status === "Completed") {
                 BadgeIcon = CheckCircle2;
                 badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                 barColor = "bg-emerald-500";
               } else if (staff.status === "In Progress") {
                 badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                 barColor = "bg-blue-500";
               } else if (staff.status === "Overdue") {
                 BadgeIcon = AlertTriangle;
                 badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                 barColor = "bg-rose-500";
               }

               return (
                 <tr 
                   key={idx} 
                   className={`hover:bg-slate-50/50 transition-colors cursor-pointer group hover:bg-indigo-50/30`}
                   onClick={() => setSelectedStaff(staff)}
                 >
                   <td className="py-3 px-4">
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] group-hover:bg-slate-200 transition-colors">
                         {staff.name.charAt(0)}
                       </div>
                       <div>
                         <p className="text-[13px] font-medium text-slate-800 leading-tight">{staff.name}</p>
                         <p className="text-[11px] text-slate-500">{staff.role} • {staff.id}</p>
                       </div>
                     </div>
                   </td>
                   <td className="py-3 px-4">
                     <ScenarioCell scenarios={staff.scenarios} />
                   </td>
                   <td className="py-3 px-4">
                     <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${staff.progress}%` }} />
                       </div>
                       <span className="text-[11px] font-medium text-slate-500 w-8 text-right">{staff.progress}%</span>
                     </div>
                   </td>
                   <td className="py-3 px-4">
                     <Badge variant="outline" className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${badgeStyle}`}>
                       <BadgeIcon className="h-3 w-3" />
                       {staff.status}
                     </Badge>
                   </td>
                   <td className="py-3 px-4 text-right">
                     {staff.status === "Completed" ? (
                       <span className={`text-[13px] font-bold ${parseInt(staff.score) >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>
                         {staff.score}
                       </span>
                     ) : (
                       <span className="text-[13px] font-medium text-slate-400">--</span>
                     )}
                   </td>
                 </tr>
               );
            })}
          </tbody>
        </table>
      </div>

      <AssessmentReportPopup 
        open={!!selectedStaff} 
        onOpenChange={(open) => !open && setSelectedStaff(null)} 
        staff={selectedStaff} 
      />
    </div>
  );
}
