"use client";

import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, History, Mail } from "lucide-react";
import { ActionHistorySheet } from "./action-history-sheet";

// Mock Data for the Matrix
const MOCK_ESCALATIONS = [
  {
    id: "1",
    name: "Dr. Ahmed Khan",
    department: "Cardiology",
    module: "Annual HIPAA Recert",
    daysOverdue: 2,
    tier: "Nudge",
    actionTaken: "System Nudge",
    cc: "None"
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    department: "ICU",
    module: "Defibrillator SOP",
    daysOverdue: 7,
    tier: "Warning",
    actionTaken: "Warning #1",
    cc: "Unit Manager"
  },
  {
    id: "3",
    name: "Maria Lopez",
    department: "Emergency",
    module: "Code Blue Protocol",
    daysOverdue: 12,
    tier: "Urgent",
    actionTaken: "Final Warning",
    cc: "Dept Head + Unit Manager"
  },
  {
    id: "4",
    name: "Dr. James Smith",
    department: "Surgery",
    module: "Annual HIPAA Recert",
    daysOverdue: 18,
    tier: "Escalated",
    actionTaken: "Reported",
    cc: "HR + Dept Head + Admin"
  },
];

export function EscalationMatrix() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getTierBadgeInfo = (tier: string) => {
    switch(tier) {
      case "Nudge": 
        return { color: "bg-blue-100 text-blue-700", label: "0-3 Days (Nudge)" };
      case "Warning": 
        return { color: "bg-orange-100 text-orange-700 flex items-center gap-1", label: "4-10 Days (Warning)" };
      case "Urgent": 
        return { color: "bg-rose-100 text-rose-700 font-bold", label: "11-15 Days (Urgent)" };
      case "Escalated": 
        return { color: "bg-red-600 text-white font-bold", label: "15+ Days (Escalated)" };
      default:
        return { color: "bg-gray-100 text-gray-700", label: tier };
    }
  };

  const handleOpenHistory = (staff: any) => {
    setSelectedStaff(staff);
    setIsSheetOpen(true);
  };

  const filteredData = MOCK_ESCALATIONS.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Ribbon */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search by staff name or department..." 
            className="pl-9 bg-gray-50 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {filteredData.length} Overdue Staff Found
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-semibold">Staff Name</TableHead>
              <TableHead className="font-semibold">Delay Tier</TableHead>
              <TableHead className="font-semibold">Overdue</TableHead>
              <TableHead className="font-semibold">Automated CCs</TableHead>
              <TableHead className="font-semibold">Last Action</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No overdue staff found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((staff) => {
                const badgeInfo = getTierBadgeInfo(staff.tier);
                return (
                  <TableRow key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                       <p className="font-medium text-gray-900">{staff.name}</p>
                       <p className="text-xs text-gray-500">{staff.department}</p>
                    </TableCell>
                    <TableCell>
                       <Badge variant="secondary" className={`border-none ${badgeInfo.color} whitespace-nowrap`}>
                          {badgeInfo.label}
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <span className={`font-semibold ${staff.daysOverdue >= 11 ? 'text-rose-600' : 'text-gray-900'}`}>
                         {staff.daysOverdue} Days
                       </span>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-sm">
                         {staff.cc !== "None" && <Mail className="h-3.5 w-3.5 text-gray-400" />}
                         <span className={staff.cc === "HR + Dept Head + Admin" ? "text-rose-600 font-medium" : "text-gray-600"}>
                           {staff.cc}
                         </span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-sm text-gray-600">{staff.actionTaken}</span>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="gap-2 border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm"
                         onClick={() => handleOpenHistory(staff)}
                       >
                         <History className="h-4 w-4" />
                         Action History
                       </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Action History Slide-out */}
      <ActionHistorySheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        staff={selectedStaff} 
      />
    </div>
  );
}
