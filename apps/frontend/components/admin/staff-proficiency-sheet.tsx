"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, BookOpen, Calendar, TrendingUp, TrendingDown, ClipboardList, 
  UserPlus, FileText, MessageSquare, AlertTriangle, CheckCircle, Clock
} from "lucide-react";

interface StaffRecord {
  id: string;
  name: string;
  role: string;
  dept: string;
  score: number;
  rec: string;
  skills: number[];
}

const SKILLS_LABELS = ["Patient Safety", "Clinical Protocols", "SOP Compliance", "Data Security"];

const MOCK_HISTORY = [
  { date: "Mar 15, 2026", assessment: "De-escalation Vol 2", score: 77, status: "Completed" },
  { date: "Feb 02, 2026", assessment: "HIPAA Annual Recert", score: 91, status: "Completed" },
  { date: "Jan 10, 2026", assessment: "Code Blue Protocol", score: 65, status: "Re-attempted" },
];

function getSkillColor(score: number) {
  if (score >= 85) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
  if (score >= 65) return { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" };
  return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" };
}

function getScoreBadge(score: number) {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 65) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

interface Props {
  record: StaffRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffProficiencySheet({ record, open, onOpenChange }: Props) {
  if (!record) return null;

  const overallColor = getSkillColor(record.score);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] p-0 overflow-y-auto">
        <SheetHeader className="border-b border-slate-200 px-6 py-5 bg-slate-50">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#e8f4f8] border border-[#bde0ec] flex items-center justify-center text-[14px] font-bold text-[#2d87a4] shrink-0">
              {record.id}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-[16px] font-bold text-slate-900 leading-tight">{record.name}</SheetTitle>
              <SheetDescription className="text-[12px] text-slate-500 font-medium mt-0.5">
                {record.role} · {record.dept}
              </SheetDescription>
            </div>
          </div>
          
          {/* Overall Score */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Overall Score</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold tracking-tight ${overallColor.text}`}>{record.score}%</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getScoreBadge(record.score)}`}>
                  {record.score >= 85 ? "Strong" : record.score >= 65 ? "Developing" : "Critical"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-[12px] gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-100">
                <UserPlus className="h-3.5 w-3.5" /> Assign Training
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[12px] gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-100">
                <FileText className="h-3.5 w-3.5" /> Full Profile
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">

          {/* Skill Breakdown */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Skill Breakdown</p>
            <div className="space-y-3">
              {SKILLS_LABELS.map((label, i) => {
                const s = record.skills[i] ?? 0;
                const c = getSkillColor(s);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center text-[12px] mb-1">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className={`font-bold ${c.text}`}>{s}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${s}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Training */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Recommended Action</p>
            <div className="flex items-start gap-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
              <ClipboardList className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-indigo-900">{record.rec}</p>
                <p className="text-[11px] text-indigo-600 mt-0.5">Click „Assign Training" to send this module directly.</p>
              </div>
            </div>
          </div>

          {/* Assessment History */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Assessment History</p>
            <div className="space-y-2">
              {MOCK_HISTORY.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${h.score >= 85 ? 'bg-emerald-100' : h.score >= 65 ? 'bg-amber-100' : 'bg-red-100'}`}>
                      {h.status === "Completed" 
                        ? <CheckCircle className={`h-4 w-4 ${h.score >= 85 ? 'text-emerald-600' : 'text-amber-600'}`} />
                        : <Clock className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800">{h.assessment}</p>
                      <p className="text-[11px] text-slate-500">{h.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-bold ${h.score >= 85 ? 'text-emerald-600' : h.score >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                      {h.score}%
                    </span>
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="View Transcript">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <p className="text-[18px] font-bold text-slate-800">3</p>
              <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide mt-0.5">Assessments</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <p className="text-[18px] font-bold text-slate-800">2.4d</p>
              <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide mt-0.5">Avg. Time</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <p className={`text-[18px] font-bold ${record.score > 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                {record.score > 70 ? "↑" : "↓"} {Math.abs(record.score - 72)}%
              </p>
              <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide mt-0.5">30d Trend</p>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
