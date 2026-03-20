"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, ShieldAlert, Award, RotateCw, FileCheck, Search } from "lucide-react";
import { ConversationDeepDiveSheet } from "./conversation-deep-dive-sheet";

const MOCK_PERFORMANCE = [
  { id: 1, staffId: "EMP-09231", name: "Michael Chang", department: "Emergency", scenario: "De-escalation", score: 92, status: "Green" },
  { id: 2, staffId: "EMP-04821", name: "Priya Sharma", department: "Cardiology", scenario: "Outside Food", score: 88, status: "Green" },
  { id: 3, staffId: "EMP-05512", name: "Alisha Davis", department: "Emergency", scenario: "Cold Food", score: 72, status: "Amber" },
  { id: 4, staffId: "EMP-01124", name: "Robert Jones", department: "ICU", scenario: "Visiting Hours", score: 68, status: "Amber" },
  { id: 5, staffId: "EMP-03882", name: "Lisa Smith", department: "Cardiology", scenario: "Angry Patient", score: 45, status: "Red" },
];

export function RagPerformanceMatrix() {
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const currentStaff = searchParams.get("staff") || "all-staff";
  const currentDept = searchParams.get("dept") || "all-dept";

  const totalGreen = MOCK_PERFORMANCE.filter(p => p.status === "Green").length;
  const totalAmber = MOCK_PERFORMANCE.filter(p => p.status === "Amber").length;
  const totalRed = MOCK_PERFORMANCE.filter(p => p.status === "Red").length;

  const filteredStaff = MOCK_PERFORMANCE.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.department.toLowerCase().includes(search.toLowerCase()) ||
                        s.scenario.toLowerCase().includes(search.toLowerCase());
    const matchStaff = currentStaff === "all-staff" || s.staffId === currentStaff;
    const matchDept = currentDept === "all-dept" || s.department.toLowerCase() === currentDept.toLowerCase();

    return matchSearch && matchStaff && matchDept;
  });

  const handleOpenDeepDive = (staff: any) => {
    setSelectedStaff(staff);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-0">
      {/* Enterprise Data Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search staff, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-[12px] bg-white border-slate-200 w-full rounded-md focus-visible:ring-1 focus-visible:ring-slate-300"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                {["Staff Name", "Department", "Scenario", "Score", "Category", "Actions"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 py-3 px-4 whitespace-nowrap">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow 
                  key={staff.id} 
                  onClick={() => handleOpenDeepDive(staff)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="py-2.5 px-4 text-[13px] font-semibold text-slate-800">
                    {staff.name}
                  </TableCell>
                  <TableCell className="py-2.5 px-4 text-[12px] font-medium text-slate-700">
                    {staff.department}
                  </TableCell>
                  <TableCell className="py-2.5 px-4 text-[12px] text-slate-600">
                    {staff.scenario}
                  </TableCell>
                  <TableCell className="py-2.5 px-4">
                    <span className={`inline-flex items-center text-[12px] font-bold tabular-nums ${
                      staff.status === 'Green' ? 'text-emerald-600' : 
                      staff.status === 'Amber' ? 'text-amber-600' : 'text-red-700'
                    }`}>
                      {staff.score}%
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-4">
                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap border ${
                      staff.status === 'Green' ? 'bg-slate-100/50 text-emerald-700 border-emerald-200/50' : 
                      staff.status === 'Amber' ? 'bg-slate-100/50 text-amber-700 border-amber-200/50' : 
                      'bg-slate-100/50 text-red-700 border-red-200/50'
                    }`}>
                      {staff.status === 'Green' ? 'Green (Pass)' : staff.status === 'Amber' ? 'Amber (Minor Fails)' : 'Red (Critical Fail)'}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 px-4 text-right">
                    <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeepDive(staff)} className="h-7 w-7 rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white transition-colors">
                         <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {staff.status === 'Green' ? (
                        <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] text-slate-600 border-slate-200 hover:bg-slate-50 gap-1">
                          <FileCheck className="h-3 w-3" /> Cert
                        </Button>
                      ) : staff.status === 'Amber' ? (
                        <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] text-slate-600 border-slate-200 hover:bg-slate-50 gap-1">
                          <RotateCw className="h-3 w-3" /> Retry
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] text-slate-600 border-slate-200 hover:bg-slate-50 gap-1">
                          <ShieldAlert className="h-3 w-3 text-red-500" /> Escalate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConversationDeepDiveSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        staff={selectedStaff}
      />
    </div>
  );
}
