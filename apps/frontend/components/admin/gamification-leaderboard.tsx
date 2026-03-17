"use client";

import React from "react";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";

// --- Mock Gamification Data ---
const TOP_UNITS = [
  { rank: 1, name: "Cardiology ICUs", score: 9.4, trend: "up", change: "+0.2" },
  { rank: 2, name: "Emergency Trauma", score: 9.1, trend: "up", change: "+0.5" },
  { rank: 3, name: "Pediatric Wing", score: 8.8, trend: "neutral", change: "0.0" },
  { rank: 4, name: "Neuro Surgey", score: 8.5, trend: "down", change: "-0.1" },
  { rank: 5, name: "Oncology Outpatient", score: 8.2, trend: "up", change: "+0.4" },
];

const TOP_TRAINERS = [
  { rank: 1, name: "Dr. Sarah Jenkins", role: "Head of Training", passRate: 98, trainees: 145 },
  { rank: 2, name: "Mark Peterson", role: "Senior Clinical Educator", passRate: 94, trainees: 210 },
  { rank: 3, name: "Aisha Patel", role: "Nursing Supervisor", passRate: 91, trainees: 89 },
  { rank: 4, name: "David Chen", role: "Specialist Trainer", passRate: 88, trainees: 112 },
  { rank: 5, name: "Rachel Adams", role: "Quality Assurance", passRate: 85, trainees: 67 },
];

export const GamificationLeaderboard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 relative z-0">
      
      {/* Target Focus: Top Performing Units */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_6px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between h-full">
        <div>
           <div className="flex items-center justify-between mb-1">
             <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
               <Trophy className="w-5 h-5 text-amber-500" />
               Leaderboard: Top performing units
             </h3>
             <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Live Ranks</span>
           </div>
           <p className="text-xs text-slate-500 mb-5 leading-relaxed">
             Ranking clinical units by their cumulative aggregated SOP score across all simulated assessments.
           </p>
        </div>

        <div className="space-y-2">
          {TOP_UNITS.map((unit) => (
            <div 
              key={unit.rank}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-default group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border
                  ${unit.rank === 1 ? 'bg-amber-100 border-amber-200 text-amber-700' : 
                    unit.rank === 2 ? 'bg-slate-200 border-slate-300 text-slate-700' :
                    unit.rank === 3 ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-500'}
                `}>
                  {unit.rank === 1 ? <Trophy className="w-4 h-4" /> : unit.rank}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{unit.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                     Rank {unit.rank} out of 24
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-sm font-bold text-slate-900">{unit.score} <span className="text-[10px] font-medium text-slate-400">/ 10</span></div>
                <div className={`text-[10px] font-bold flex items-center mt-0.5 ${
                  unit.trend === 'up' ? 'text-emerald-500' : unit.trend === 'down' ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  {unit.trend === 'up' && '↑'}
                  {unit.trend === 'down' && '↓'}
                  {unit.trend === 'neutral' && '→'}
                  <span className="ml-0.5">{unit.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Focus: Top Trainers Leaderboard */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_6px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between h-full">
        <div>
           <div className="flex items-center justify-between mb-1">
             <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
               <Medal className="w-5 h-5 text-indigo-500" />
               Leaderboard: Top impact educators
             </h3>
             <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Most Passed</span>
           </div>
           <p className="text-xs text-slate-500 mb-5 leading-relaxed">
             Ranking trainers and clinical educators based on their cohorts' percentage pass rates.
           </p>
        </div>

        <div className="space-y-2">
          {TOP_TRAINERS.map((trainer) => (
            <div 
              key={trainer.rank}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-default group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border
                  ${trainer.rank === 1 ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 
                    trainer.rank === 2 ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                    trainer.rank === 3 ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white border-slate-200 text-slate-500'}
                `}>
                  {trainer.rank === 1 ? <Star className="w-4 h-4 fill-indigo-600" /> : trainer.rank}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{trainer.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                     {trainer.role}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-sm font-bold text-emerald-600 group-hover:text-emerald-500 transition-colors">{trainer.passRate}%</div>
                <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                  Over {trainer.trainees} sessions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
