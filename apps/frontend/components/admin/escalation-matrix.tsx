"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, History, BellRing, Mail, Filter } from "lucide-react";
import { ActionHistorySheet } from "./action-history-sheet";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
interface StaffRow {
  id: string;
  staffId: string;
  name: string;
  department: string;
  unit: string;
  dueDate: string;
  daysOverdue: number;
  tier: "Nudge" | "Warning" | "Urgent" | "Escalated";
  cc: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const DATA: StaffRow[] = [
  { id: "1", staffId: "HOS-1041", name: "Dr. Ahmed Khan",   department: "Cardiology", unit: "Ward 4B",   dueDate: "Mar 16", daysOverdue: 2,  tier: "Nudge",    cc: "—" },
  { id: "2", staffId: "HOS-2187", name: "Priya Nair",       department: "Radiology",  unit: "Imaging",   dueDate: "Mar 15", daysOverdue: 3,  tier: "Nudge",    cc: "—" },
  { id: "3", staffId: "HOS-3302", name: "Sarah Jenkins",    department: "ICU",        unit: "ICU-2",     dueDate: "Mar 11", daysOverdue: 7,  tier: "Warning",  cc: "Unit Manager" },
  { id: "4", staffId: "HOS-0954", name: "Tom Bradley",      department: "Pharmacy",   unit: "Dispensary",dueDate: "Mar 09", daysOverdue: 9,  tier: "Warning",  cc: "Unit Manager" },
  { id: "5", staffId: "HOS-1775", name: "Maria Lopez",      department: "Emergency",  unit: "ER-High",   dueDate: "Mar 06", daysOverdue: 12, tier: "Urgent",   cc: "Dept. Head + Unit Mgr" },
  { id: "6", staffId: "HOS-2239", name: "Aisha Malik",      department: "Oncology",   unit: "Chemo Bay", dueDate: "Mar 04", daysOverdue: 14, tier: "Urgent",   cc: "Dept. Head + Unit Mgr" },
  { id: "7", staffId: "HOS-0088", name: "Dr. James Smith",  department: "Surgery",    unit: "OR-3",      dueDate: "Feb 28", daysOverdue: 18, tier: "Escalated",cc: "HR + Dept. Head + Admin" },
  { id: "8", staffId: "HOS-3410", name: "Carlos Rivera",    department: "Pediatrics", unit: "PICU",      dueDate: "Feb 25", daysOverdue: 22, tier: "Escalated",cc: "HR + Dept. Head + Admin" },
];

// ── Badge config ─────────────────────────────────────────────────────────────
const TIER: Record<StaffRow["tier"], { pill: string; label: string }> = {
  Nudge:     { pill: "bg-slate-100 text-slate-600 border border-slate-200",       label: "Nudged" },
  Warning:   { pill: "bg-amber-50  text-amber-700 border border-amber-200",       label: "Warning" },
  Urgent:    { pill: "bg-red-50    text-red-700   border border-red-200",         label: "Urgent" },
  Escalated: { pill: "bg-slate-800 text-white     border border-slate-900",       label: "Escalated to HR" },
};

const FILTER: Record<string, (d: number) => boolean> = {
  all:       () => true,
  nudge:     (d) => d <= 3,
  warning:   (d) => d >= 4  && d <= 10,
  urgent:    (d) => d >= 11 && d <= 15,
  escalated: (d) => d > 15,
};

const FILTER_OPTIONS = [
  { value: "all",       label: "All Overdue Stages" },
  { value: "nudge",     label: "0–3 Days (Nudged)" },
  { value: "warning",   label: "4–10 Days (Warning)" },
  { value: "urgent",    label: "11–15 Days (Urgent)" },
  { value: "escalated", label: "15+ Days (Escalated)" },
];

// ── Component ────────────────────────────────────────────────────────────────
export function EscalationMatrix() {
  const [search, setSearch]             = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [drawerStaff, setDrawerStaff]   = useState<StaffRow | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  const openDrawer = (s: StaffRow) => { setDrawerStaff(s); setDrawerOpen(true); };

  const toggle = (id: string) =>
    setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const searchParams = useSearchParams();
  const getFilterScore = () => {
    let score = 0;
    searchParams.forEach((val, key) => {
       if (val && !val.startsWith("all-") && val !== "last-30") score += val.length;
    });
    return score;
  };
  const filterScore = getFilterScore();

  const rows = DATA.filter((_, i) => filterScore === 0 || (i % ((filterScore % 3) + 1) === 0)).filter(
    (s) =>
      FILTER[activeFilter]?.(s.daysOverdue) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase()) ||
        s.staffId.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleAll = () => {
    const ids = rows.map((r) => r.id);
    const allSel = ids.every((id) => selected.has(id));
    setSelected((p) => {
      const n = new Set(p);
      ids.forEach((id) => (allSel ? n.delete(id) : n.add(id)));
      return n;
    });
  };

  const handleBulkNudge = () => {
    toast.success(`Nudge sent to ${selected.size} staff member(s).`);
    setSelected(new Set());
  };

  const allSel = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search staff, ID, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-[13px] bg-white border-slate-200 w-full sm:w-64 rounded-md"
            />
          </div>

          {/* Aging Filter Dropdown */}
          <div className="relative">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="h-9 w-[190px] border-slate-200 bg-white text-[13px]">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="Filter by Stage" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selected.size > 0 ? (
          <Button
            size="sm"
            onClick={handleBulkNudge}
            className="h-9 text-[12px] bg-slate-800 hover:bg-slate-700 text-white gap-2 px-4 shadow-sm"
          >
            <BellRing className="h-4 w-4" />
            Nudge Selected ({selected.size})
          </Button>
        ) : (
          <span className="text-[12px] text-slate-500 font-medium hidden sm:block">
            {rows.length} records found
          </span>
        )}
      </div>

      {/* Enterprise Data Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
              <TableHead className="w-8 py-3 px-4">
                <input
                  type="checkbox"
                  checked={allSel}
                  onChange={toggleAll}
                  className="rounded-sm border-slate-300 accent-slate-800 cursor-pointer h-4 w-4"
                />
              </TableHead>
              {["Staff ID", "Name", "Dept / Unit", "Due Date", "Days Late", "Status", "Actions"].map((h) => (
                <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 py-3 px-4 whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-400 text-xs">
                  No records match your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => {
                const t = TIER[s.tier];
                const isSel = selected.has(s.id);
                return (
                  <TableRow
                    key={s.id}
                    onClick={() => openDrawer(s)}
                    className={`cursor-pointer border-b border-slate-100 transition-colors
                      ${isSel ? "bg-slate-50/80" : "hover:bg-slate-50/50"}`}
                  >
                    <TableCell className="py-2.5 px-4" onClick={(e) => { e.stopPropagation(); toggle(s.id); }}>
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggle(s.id)}
                        className="rounded-sm border-slate-300 accent-slate-800 cursor-pointer h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-[12px] font-mono text-slate-500 font-medium">{s.staffId}</TableCell>
                    <TableCell className="py-2.5 px-4">
                      <span className="text-[13px] font-semibold text-slate-800">{s.name}</span>
                    </TableCell>
                    <TableCell className="py-2.5 px-4">
                      <span className="text-[12px] font-medium text-slate-700">{s.department}</span>
                      <span className="text-[11px] text-slate-400 ml-1">/ {s.unit}</span>
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-[12px] text-slate-500 font-medium">{s.dueDate}</TableCell>
                    <TableCell className="py-2.5 px-4">
                      <span className={`inline-flex items-center text-[12px] font-bold tabular-nums ${s.daysOverdue > 15 ? "text-slate-800" : s.daysOverdue > 10 ? "text-red-700" : s.daysOverdue > 3 ? "text-amber-700" : "text-slate-500"}`}>
                        +{s.daysOverdue}d
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 px-4">
                      <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${t.pill}`}>
                        {t.label}
                      </span>
                    </TableCell>
                    <TableCell
                      className="py-2.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Send Email"
                          onClick={() => toast.success(`Email sent to ${s.name}`)}
                          className="h-7 w-7 rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Action History"
                          onClick={() => openDrawer(s)}
                          className="h-7 w-7 rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Side Drawer */}
      <ActionHistorySheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        staff={drawerStaff}
      />
    </div>
  );
}
