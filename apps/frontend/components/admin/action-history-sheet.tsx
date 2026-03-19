"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Clock, FileText, CheckCircle2, Mail, RotateCcw, PauseCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ActionHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: any;
}

const CONTACTS: Record<string, { role: string; email: string }> = {
  "Dr. Ahmed Khan":  { role: "Cardiologist",      email: "ahmed.khan@hospital.org" },
  "Priya Nair":      { role: "Radiographer",       email: "priya.nair@hospital.org" },
  "Sarah Jenkins":   { role: "ICU Nurse",          email: "s.jenkins@hospital.org" },
  "Tom Bradley":     { role: "Pharmacist",         email: "t.bradley@hospital.org" },
  "Maria Lopez":     { role: "ER Physician",       email: "m.lopez@hospital.org" },
  "Aisha Malik":     { role: "Oncology Nurse",     email: "a.malik@hospital.org" },
  "Dr. James Smith": { role: "Surgical Attending", email: "j.smith@hospital.org" },
  "Carlos Rivera":   { role: "PICU Specialist",    email: "c.rivera@hospital.org" },
};

const TIER_BADGE: Record<string, string> = {
  Nudge:     "bg-slate-100 text-slate-600 border border-slate-200",
  Warning:   "bg-amber-50  text-amber-700 border border-amber-200",
  Urgent:    "bg-red-50    text-red-700   border border-red-200",
  Escalated: "bg-slate-800 text-white",
};

type LogEntry = {
  id: number;
  type: "auto" | "system" | "manual";
  text: string;
  date: string;
};

const BASE_LOG: LogEntry[] = [
  { id: 1, type: "auto",   text: "Automated Gentle Reminder sent to staff.",                       date: "Mar 17, 2026 · 09:00 AM" },
  { id: 2, type: "auto",   text: "Automated Warning sent — CC: Unit Manager.",                     date: "Mar 21, 2026 · 09:00 AM" },
  { id: 3, type: "system", text: "Staff opened assessment link. Session incomplete (2m 14s).",     date: "Mar 21, 2026 · 11:32 AM" },
];

export function ActionHistorySheet({ open, onOpenChange, staff }: ActionHistorySheetProps) {
  const [log, setLog]               = useState<LogEntry[]>(BASE_LOG);
  const [note, setNote]             = useState("");
  const [isSaving, setIsSaving]     = useState(false);

  if (!staff) return null;

  const contact = CONTACTS[staff.name] ?? { role: staff.department, email: `${staff.name.toLowerCase().replace(/ /g,".")}@hospital.org` };

  const addLog = (text: string, type: LogEntry["type"] = "manual") => {
    setLog((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        text,
        date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handlePause = () => {
    if (!note.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      addLog(`Escalation paused by Admin. Reason: ${note}`);
      setNote("");
      setIsSaving(false);
      toast.success("Escalation paused. Log updated.");
    }, 500);
  };

  const handleEmail = () => {
    addLog(`Manual email sent to ${staff.name} by Admin.`);
    toast.success(`Email sent to ${contact.email}`);
  };

  const handleRetake = () => {
    addLog(`Force retake issued by Admin for "${staff.module}".`);
    toast(`Retake triggered for ${staff.name}.`, { icon: "🔁" });
  };

  const iconFor = (type: LogEntry["type"]) => {
    if (type === "manual") return <CheckCircle2 className="h-3 w-3" />;
    if (type === "system") return <Clock className="h-3 w-3" />;
    return <Send className="h-3 w-3" />;
  };

  const dotColor = (type: LogEntry["type"]) =>
    type === "manual" ? "bg-slate-800 text-white" : type === "system" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="text-[14px] font-bold text-slate-900 leading-tight">{staff.name}</SheetTitle>
              <p className="text-[11px] text-slate-500 mt-0.5">{contact.role} · {staff.department}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{staff.staffId} · {contact.email}</p>
            </div>
            <span className={`mt-0.5 flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIER_BADGE[staff.tier] ?? "bg-slate-100 text-slate-600"}`}>
              {staff.tier}
            </span>
          </div>

          {/* Quick stats strip */}
          <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded bg-slate-50/60">
            {[
              { label: "Due Date",    val: staff.dueDate },
              { label: "Days Late",   val: `+${staff.daysOverdue}d`, cls: "text-red-700 font-bold" },
              { label: "Assignment",  val: staff.module ?? staff.department },
            ].map(({ label, val, cls }) => (
              <div key={label} className="px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
                <p className={`text-[12px] mt-0.5 font-medium text-slate-700 truncate ${cls ?? ""}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Audit Log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Audit Log</p>
              <span className="text-[10px] text-slate-400">{log.length} events</span>
            </div>
            <div className="relative border-l border-slate-200 ml-2 space-y-4">
              {log.map((item) => (
                <div key={item.id} className="relative pl-5">
                  <span className={`absolute -left-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-white ${dotColor(item.type)}`}>
                    {iconFor(item.type)}
                  </span>
                  <p className={`text-[12px] leading-snug ${item.type === "manual" ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                    {item.text}
                  </p>
                  <time className="text-[10px] text-slate-400 mt-0.5 block">{item.date}</time>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Admin Controls */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Admin Controls</p>

            {/* Quick action row */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                className="flex-1 h-8 text-[12px] border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" /> Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="flex-1 h-8 text-[12px] border-amber-200 text-amber-700 hover:bg-amber-50 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Force Retake
              </Button>
            </div>

            {/* Pause escalation form */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <PauseCircle className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-[12px] font-semibold text-slate-700">Pause Escalation Timer</p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Adding a justification note will suspend automated escalation emails for this staff member until manually resumed.
              </p>
              <Textarea
                placeholder='e.g. "Staff on certified medical leave until Apr 2. Deadline extended by 14 days."'
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                className="resize-none h-20 text-[12px] bg-white border-slate-200"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handlePause}
                  disabled={!note.trim() || isSaving}
                  size="sm"
                  className="flex-1 h-8 text-[12px] bg-slate-800 hover:bg-slate-700 text-white gap-1.5"
                >
                  <PauseCircle className="h-3.5 w-3.5" />
                  {isSaving ? "Saving…" : "Pause Escalation"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNote("")}
                  className="h-8 text-[12px] border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
