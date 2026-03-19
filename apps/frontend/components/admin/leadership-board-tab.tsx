import React from "react";
import { 
  TrendingUp, TrendingDown, Award, Star, Medal, ArrowUpRight, 
  ArrowDownRight, Mail, Calendar, User, ChevronRight 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { KpiCardUnified } from "./kpi-card-unified";
import { PriorityFocusAreas } from "./priority-focus-areas";

const MOCK_ELITE_UNITS = [
  { rank: 1, name: "Cardiology Wing", manager: "Dr. A. Chen", initials: "AC", score: 98.5, time: "2.1 days", trend: "+4.2%" },
  { rank: 2, name: "Pediatrics", manager: "L. Jenkins, RN", initials: "LJ", score: 96.0, time: "2.8 days", trend: "+1.5%" },
  { rank: 3, name: "ICU Unit B", manager: "Dr. M. Torres", initials: "MT", score: 94.2, time: "3.5 days", trend: "-0.8%" },
  { rank: 4, name: "Oncology", manager: "S. Williams", initials: "SW", score: 91.8, time: "4.0 days", trend: "+2.0%" },
  { rank: 5, name: "Neurology", manager: "Dr. K. Patel", initials: "KP", score: 89.5, time: "4.2 days", trend: "+1.1%" },
];

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-[#fefce8] border-[#eab308] text-[#854d0e] shadow-sm"; // Subtle Gold
  if (rank === 2) return "bg-[#f8fafc] border-[#94a3b8] text-[#475569] shadow-sm"; // Subtle Silver
  if (rank === 3) return "bg-[#fff7ed] border-[#fb923c] text-[#9a3412] shadow-sm"; // Subtle Bronze
  return "bg-slate-50 border-slate-200 text-slate-500";
}

export function LeadershipBoardTab() {
  return (
    <div className="space-y-6">
      
      {/* TOP SECTION: The Excellence Podium (4-Col Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Widget 1: Elite Unit */}
        <KpiCardUnified
          label="Elite Unit"
          value={<div className="text-[15px] truncate">Cardiology Wing</div>}
          sub={
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-fit">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 98.5% Green
            </span>
          }
          icon={<Award className="h-4 w-4" />}
          iconColor="text-emerald-600"
        />

        {/* Widget 2: Most Improved */}
        <KpiCardUnified
          label="Most Improved"
          value={<div className="text-[15px] truncate">Pediatrics</div>}
          sub={
            <span className="text-[11px] font-semibold text-indigo-700 flex items-center bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 w-fit">
              +24% Compliance
            </span>
          }
          icon={<TrendingUp className="h-4 w-4" />}
          iconColor="text-indigo-500"
        />

        {/* Widget 3: Top Trainer Efficiency */}
        <KpiCardUnified
          label="Top Trainer Speed"
          value={<div className="text-[15px] truncate">Sarah L. (RN Educator)</div>}
          sub={
            <span className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded w-fit">
              1.8 Days to Pass
            </span>
          }
          icon={<Medal className="h-4 w-4" />}
          iconColor="text-blue-500"
        />

        {/* Widget 4: SOP Champion */}
        <KpiCardUnified
          label="Individual SOP Champ"
          value={<div className="text-[15px] truncate">Dr. A. Chen</div>}
          sub={
            <span className="text-[11px] font-semibold text-[#854d0e] bg-[#fefce8] border border-[#fef08a] px-1.5 py-0.5 rounded w-fit">
              100% Core Score
            </span>
          }
          icon={<Star className="h-4 w-4" />}
          iconColor="text-[#b45309]"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* MIDDLE SECTION: The Ranking Matrix (Spans 3 cols on large screens) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <Tabs defaultValue="elite-units" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-2 pt-2">
              <TabsList className="bg-transparent h-10 w-full justify-start gap-4">
                <TabsTrigger 
                  value="elite-units" 
                  className="data-[state=active]:bg-white data-[state=active]:border-slate-200 data-[state=active]:border-b-white border border-transparent border-b-0 rounded-t-md rounded-b-none px-4 py-2 text-[13px] font-semibold text-slate-600 data-[state=active]:text-slate-900 shadow-none data-[state=active]:shadow-sm"
                >
                  Elite Units
                </TabsTrigger>
                <TabsTrigger 
                  value="most-improved" 
                  className="data-[state=active]:bg-white data-[state=active]:border-slate-200 data-[state=active]:border-b-white border border-transparent border-b-0 rounded-t-md rounded-b-none px-4 py-2 text-[13px] font-semibold text-slate-600 data-[state=active]:text-slate-900 shadow-none data-[state=active]:shadow-sm"
                >
                  Most Improved
                </TabsTrigger>
                <TabsTrigger 
                  value="trainer-efficiency" 
                  className="data-[state=active]:bg-white data-[state=active]:border-slate-200 data-[state=active]:border-b-white border border-transparent border-b-0 rounded-t-md rounded-b-none px-4 py-2 text-[13px] font-semibold text-slate-600 data-[state=active]:text-slate-900 shadow-none data-[state=active]:shadow-sm"
                >
                  Trainer Efficiency
                </TabsTrigger>
                <TabsTrigger 
                  value="sop-champs" 
                  className="data-[state=active]:bg-white data-[state=active]:border-slate-200 data-[state=active]:border-b-white border border-transparent border-b-0 rounded-t-md rounded-b-none px-4 py-2 text-[13px] font-semibold text-slate-600 data-[state=active]:text-slate-900 shadow-none data-[state=active]:shadow-sm"
                >
                  SOP Champions
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="elite-units" className="m-0 border-none outline-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 w-16 text-center">Rank</th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Department Name</th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Manager</th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 w-32">Compliance</th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Time to Comp.</th>
                      <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] bg-white">
                    {MOCK_ELITE_UNITS.map((unit) => (
                      <tr key={unit.rank} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-none">
                        <td className="px-4 py-3 text-center">
                          <div className={`mx-auto w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] border ${getRankStyle(unit.rank)}`}>
                            {unit.rank}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{unit.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                              {unit.initials}
                            </div>
                            <span className="text-slate-600 text-[12px] font-medium">{unit.manager}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 w-full max-w-[100px]">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-emerald-700">{unit.score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${unit.score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-[12px] font-medium text-slate-500">
                          {unit.time}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={`inline-flex items-center text-[11px] font-bold ${unit.trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {unit.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                            {unit.trend}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="most-improved" className="p-8 text-center text-slate-500 text-sm m-0 border-none">
              Most Improved Unit data visualization would go here.
            </TabsContent>
            <TabsContent value="trainer-efficiency" className="p-8 text-center text-slate-500 text-sm m-0 border-none">
              Trainer Efficiency visualization would go here.
            </TabsContent>
            <TabsContent value="sop-champs" className="p-8 text-center text-slate-500 text-sm m-0 border-none">
              SOP Champions visualization would go here.
            </TabsContent>
          </Tabs>
        </div>

        {/* BOTTOM/SIDE SECTION: Priority Focus Areas */}
        <div className="lg:col-span-1 flex flex-col h-full">
           <PriorityFocusAreas />
        </div>

      </div>

    </div>
  );
}
