"use client";

import React from "react";
import { Trophy, TrendingUp, Medal } from "lucide-react";

const TOP_PERFORMERS = [
  {
    id: "EMP-04821",
    name: "Priya Sharma",
    role: "Cardiologist",
    score: 98,
    scenarios: 12,
    rank: 1,
    color: "from-amber-400 to-amber-600",
    bgLight: "bg-amber-50 border-amber-200",
    textDark: "text-amber-700"
  },
  {
    id: "EMP-05512",
    name: "Alisha Davis",
    role: "Radiology Tech",
    score: 95,
    scenarios: 8,
    rank: 2,
    color: "from-slate-400 to-slate-500",
    bgLight: "bg-slate-50 border-slate-200",
    textDark: "text-slate-700"
  },
  {
    id: "EMP-09231",
    name: "Michael Chang",
    role: "ER Nurse",
    score: 92,
    scenarios: 14,
    rank: 3,
    color: "from-orange-400 to-orange-600",
    bgLight: "bg-orange-50 border-orange-200",
    textDark: "text-orange-700"
  },
  {
    id: "EMP-01124",
    name: "Robert Jones",
    role: "Pediatrics",
    score: 89,
    scenarios: 10,
    rank: 4,
    color: "from-indigo-400 to-indigo-600",
    bgLight: "bg-indigo-50 border-indigo-200",
    textDark: "text-indigo-700"
  }
];

export function UnitTopPerformersWidget() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm w-full">
      {TOP_PERFORMERS.map((performer, idx) => (
        <div 
          key={performer.id} 
          className={`relative p-4 rounded-xl border ${performer.bgLight} overflow-hidden group hover:shadow-md transition-all duration-300`}
        >
          {/* Subtle background gradient overlay across the card */}
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${performer.color} opacity-10 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`} />
          
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-tr ${performer.color} font-bold text-sm shadow-sm`}>
                   {performer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-[14px] text-slate-800 leading-tight">{performer.name}</h3>
                  <p className="text-[12px] text-slate-500">{performer.role}</p>
                </div>
             </div>
             
             {/* Rank Badge */}
             <div className="flex flex-col items-center">
                 {performer.rank === 1 ? (
                   <Trophy className={`h-5 w-5 ${performer.textDark}`} />
                 ) : (
                   <Medal className={`h-5 w-5 ${performer.textDark} opacity-80`} />
                 )}
                 <span className={`text-[10px] font-bold ${performer.textDark} mt-1 uppercase tracking-wider`}>Rank {performer.rank}</span>
             </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-white/40">
            <div>
               <p className="text-[11px] font-medium text-slate-500">Overall Score</p>
               <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-xl font-black ${performer.textDark}`}>{performer.score}</span>
                  <span className="text-[12px] font-medium text-slate-500">pts</span>
               </div>
            </div>
            
            <div className="text-right">
               <p className="text-[11px] font-medium text-slate-500">Modules</p>
               <div className="flex items-center gap-1 mt-1 justify-end">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-[13px] font-bold text-slate-700">{performer.scenarios} completed</span>
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
