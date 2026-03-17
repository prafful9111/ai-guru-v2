"use client";

import React, { useState } from "react";
import { Search, Mail, MessageSquare, AlertTriangle, ShieldAlert, ArrowUpRight, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// --- Mock Data ---
const MOCK_ASSESSMENTS = [
  {
    id: "1",
    name: "Dr. Anjali Mehta",
    empCode: "EMP-4012",
    role: "Senior Resident",
    unit: "ICU - Main",
    department: "Critical Care",
    timelineStatus: "D+3",
    timelineText: "Reminders Sent",
    timelineColor: "amber",
    reassessmentCycle: "15-day",
    lastActive: "2 days ago",
    status: "pending"
  },
  {
    id: "2",
    name: "Rahul Sharma",
    empCode: "EMP-1089",
    role: "Staff Nurse",
    unit: "Emergency Dept",
    department: "Triage",
    timelineStatus: "D+10",
    timelineText: "Escalated to HOD",
    timelineColor: "rose",
    reassessmentCycle: "30-day",
    lastActive: "Never logged in",
    status: "critical"
  },
  {
    id: "3",
    name: "Sneha Patel",
    empCode: "EMP-2301",
    role: "Financial Counselor",
    unit: "Billing",
    department: "Finance",
    timelineStatus: "Completed",
    timelineText: "Passed (Green)",
    timelineColor: "emerald",
    reassessmentCycle: "Annual",
    lastActive: "Today",
    status: "passed"
  },
  {
    id: "4",
    name: "Amit Kumar",
    empCode: "EMP-3122",
    role: "Technician",
    unit: "Radiology",
    department: "Diagnostics",
    timelineStatus: "D+7",
    timelineText: "Final Warning",
    timelineColor: "amber",
    reassessmentCycle: "15-day",
    lastActive: "1 week ago",
    status: "warning"
  },
  {
    id: "5",
    name: "Priya Singh",
    empCode: "EMP-5001",
    role: "Front Desk Exec",
    unit: "OPD G-Floor",
    department: "Registration",
    timelineStatus: "D+10",
    timelineText: "Escalated to HR",
    timelineColor: "rose",
    reassessmentCycle: "30-day",
    lastActive: "Never logged in",
    status: "critical"
  }
];

export const StaffAssessmentHub = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = MOCK_ASSESSMENTS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#2d87a4]" />
            Staff Assessment & Action Hub
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage timelines, trigger manual reassessments, and escalate pending staff actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search staff, ID, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm w-[250px] bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300 shadow-none"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 shadow-none text-slate-600">
            Export Roster
          </Button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="font-medium py-3 px-5 w-[250px]">Participant Details</th>
              <th className="font-medium py-3 px-5">Unit & Dept.</th>
              <th className="font-medium py-3 px-5">Timeline (D-Day)</th>
              <th className="font-medium py-3 px-5">Re-assessment</th>
              <th className="font-medium py-3 px-5 text-right">Inline Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors group">
                
                {/* Column 1: Participant */}
                <td className="py-3 px-5">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{staff.name}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {staff.empCode} • <span className="text-slate-600 font-medium">{staff.role}</span>
                    </span>
                  </div>
                </td>

                {/* Column 2: Unit & Dept */}
                <td className="py-3 px-5">
                  <div className="flex flex-col">
                    <span className="text-slate-700 font-medium">{staff.unit}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{staff.department}</span>
                  </div>
                </td>

                {/* Column 3: Timeline (D-Day) */}
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2">
                    {staff.timelineColor === "rose" && (
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    )}
                    {staff.timelineColor === "amber" && (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    {staff.timelineColor === "emerald" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                    
                    <div className="flex flex-col">
                      <span className={`font-semibold ${
                        staff.timelineColor === 'rose' ? 'text-rose-600' :
                        staff.timelineColor === 'amber' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {staff.timelineStatus}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{staff.timelineText}</span>
                    </div>
                  </div>
                </td>

                {/* Column 4: Re-assessment */}
                <td className="py-3 px-5">
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[9px] font-semibold tracking-wide rounded-sm pointer-events-none hover:bg-slate-100 px-1.5 border-slate-200">
                      {staff.reassessmentCycle} CYCLE
                    </Badge>
                    <span className="text-[10px] text-slate-400">Activity: {staff.lastActive}</span>
                  </div>
                </td>

                {/* Column 5: Inline Actions */}
                <td className="py-3 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 shadow-none"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 shadow-none"
                      title="Email Participant"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </Button>
                    {staff.status === 'critical' ? (
                       <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7 text-[10px] px-2.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-none"
                      >
                         Escalate HOD <ArrowUpRight className="ml-1 w-3 h-3" />
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7 text-[10px] px-2.5 rounded shadow-none text-slate-600 border-slate-200 bg-white"
                      >
                         View Details
                      </Button>
                    )}
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">
            No participants found matching your search.
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredData.length} of {MOCK_ASSESSMENTS.length} participants</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] shadow-none" disabled>Previous</Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] shadow-none">Next</Button>
        </div>
      </div>
    </div>
  );
};
