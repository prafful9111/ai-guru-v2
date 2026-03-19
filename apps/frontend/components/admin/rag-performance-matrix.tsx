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
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ShieldAlert, Award, RotateCw } from "lucide-react";
import { ConversationDeepDiveSheet } from "./conversation-deep-dive-sheet";

const MOCK_PERFORMANCE = [
  { id: 1, name: "Dr. James Smith", department: "Surgery", scenario: "Code Blue", score: 98, status: "Green" },
  { id: 2, name: "Sarah Jenkins", department: "ICU", scenario: "Code Blue", score: 92, status: "Green" },
  { id: 3, name: "Michael Chen", department: "Emergency", scenario: "De-escalation", score: 72, status: "Amber" },
  { id: 4, name: "Maria Lopez", department: "Emergency", scenario: "Routine Checkup", score: 68, status: "Amber" },
  { id: 5, name: "Dr. Ahmed Khan", department: "Cardiology", scenario: "Angry Patient", score: 45, status: "Red" },
];

export function RagPerformanceMatrix() {
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const totalGreen = MOCK_PERFORMANCE.filter(p => p.status === "Green").length;
  const totalAmber = MOCK_PERFORMANCE.filter(p => p.status === "Amber").length;
  const totalRed = MOCK_PERFORMANCE.filter(p => p.status === "Red").length;

  const handleOpenDeepDive = (staff: any) => {
    setSelectedStaff(staff);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary Cards */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">SOP Masters (Green)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900 leading-none">{totalGreen}</span>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Staff</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Developing (Amber)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900 leading-none">{totalAmber}</span>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Staff</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <RotateCw className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-4">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">High Risk (Red)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900 leading-none">{totalRed}</span>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Staff</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Staff</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Scenario</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Score</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PERFORMANCE.map((staff) => (
              <TableRow key={staff.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => handleOpenDeepDive(staff)}>
                <TableCell>
                  <p className="font-medium text-gray-900">{staff.name}</p>
                  <p className="text-xs text-gray-500">{staff.department}</p>
                </TableCell>
                <TableCell className="text-sm text-gray-700">{staff.scenario}</TableCell>
                <TableCell className="text-center">
                  <span className={`text-lg font-bold ${
                    staff.status === 'Green' ? 'text-emerald-600' : 
                    staff.status === 'Amber' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {staff.score}%
                  </span>
                </TableCell>
                <TableCell>
                  {staff.status === "Green" && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-none border-none pointer-events-none">Green (Pass)</Badge>}
                  {staff.status === "Amber" && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-none border-none pointer-events-none">Amber (Minor Fails)</Badge>}
                  {staff.status === "Red" && <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 shadow-none border-none pointer-events-none">Red (Critical Fail)</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDeepDive(staff)} className="text-[#2d87a4] hover:bg-blue-50 font-medium h-8 px-2">
                       <Eye className="h-4 w-4 mr-1" />
                       Review
                    </Button>
                    {staff.status === 'Green' ? (
                      <Button variant="outline" size="sm" className="h-8 text-xs border-gray-200 shadow-sm text-gray-700">Certificate</Button>
                    ) : staff.status === 'Amber' ? (
                      <Button variant="outline" size="sm" className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 bg-amber-50/30">Assign Retry</Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-8 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 bg-rose-50/30">Escalate</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConversationDeepDiveSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        staff={selectedStaff}
      />
    </div>
  );
}
