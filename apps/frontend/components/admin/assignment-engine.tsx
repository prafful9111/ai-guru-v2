"use client";

import React, { useState } from "react";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue
} from "@/components/ui/select";
import { HierarchicalScenarioDropdown } from "./hierarchical-scenario-dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, BarChart3, ChevronRight, Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function AssignmentEngine() {
  const [targetType, setTargetType] = useState("");
  const [targetDept, setTargetDept] = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!targetType || !targetDept || !targetGroup || scenarios.length === 0) {
       toast.error("Please complete all matrix selections.");
       return;
    }

    setIsAssigning(true);
    try {
      // Mock API allocation logic
      await new Promise(res => setTimeout(res, 1200));
      toast.success(`Allocated ${scenarios.length} scenario(s) to matched staff.`);
      setTargetType("");
      setTargetDept("");
      setTargetGroup("");
      setScenarios([]);
    } catch (error) {
      toast.error("Failed to allocate scenarios.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Step 1: Target Audience */}
         <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
               <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100/50 rounded-md text-blue-600"><Users className="h-4 w-4" /></div>
                  1. Target Audience
               </CardTitle>
               <CardDescription>Select the group of staff members to assign training to.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 bg-white">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Staff Type</label>
                  <Select value={targetType} onValueChange={setTargetType}>
                     <SelectTrigger className="w-full bg-gray-50">
                        <SelectValue placeholder="Select role (e.g. All Nurses)" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="Nurse">All Nurses</SelectItem>
                        <SelectItem value="Doctor">All Doctors</SelectItem>
                        <SelectItem value="Admin">All Admins</SelectItem>
                        <SelectItem value="Everyone">Everyone</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department / Unit</label>
                  <Select value={targetDept} onValueChange={setTargetDept}>
                     <SelectTrigger className="w-full bg-gray-50">
                        <SelectValue placeholder="Select department (e.g. Cardiology)" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Emergency">Emergency Room</SelectItem>
                        <SelectItem value="ICU">ICU Unit</SelectItem>
                        <SelectItem value="Any">Any Department</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-700">Training Group (Upload Batch)</label>
                  <Select value={targetGroup} onValueChange={setTargetGroup}>
                     <SelectTrigger className="w-full bg-gray-50 border-primary/20 bg-primary/5">
                        <SelectValue placeholder="Select uploaded cohort" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="All">All Staff (Ignore Batch)</SelectItem>
                        <SelectItem value="BATCH-2026-03-20">Group: 2026-03-20 (20 users)</SelectItem>
                        <SelectItem value="BATCH-2026-03-19">Group: 2026-03-19 (15 users)</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </CardContent>
         </Card>

         {/* Step 2: Training Scenario */}
         <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
               <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100/50 rounded-md text-indigo-600"><BookOpen className="h-4 w-4" /></div>
                  2. Training Assigment
               </CardTitle>
               <CardDescription>Select the AI simulation and set its parameters.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 bg-white">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Scenario Selection (Versioned)</label>
                  <HierarchicalScenarioDropdown 
                     selected={scenarios}
                     onChange={setScenarios}
                  />
               </div>
            </CardContent>
         </Card>
      </div>

       <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
         <div className="flex-1 space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">Rule-Based Allocation Summary</h3>
            <p className="text-gray-600">
               Matched staff members will be immediately assigned the <span className="font-semibold text-gray-800">{scenarios.length > 0 ? `${scenarios.length} selected` : "..."}</span> modules.
            </p>
         </div>
         <Button 
            size="lg" 
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
            onClick={handleAssign}
            disabled={isAssigning || !targetType || !targetDept || !targetGroup || scenarios.length === 0}
         >
            {isAssigning ? <Loader2 className="h-4 w-4 animate-spin"/> : <Zap className="h-4 w-4" />}
            Execute Assignment logic
         </Button>
      </div>
    </div>
  );
}
