"use client";

import React, { useState } from "react";
import { 
   Select, 
   SelectContent, 
   SelectItem, 
   SelectTrigger, 
   SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, BarChart3, ChevronRight, Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function AssignmentEngine() {
  const [targetType, setTargetType] = useState("");
  const [targetDept, setTargetDept] = useState("");
  const [scenario, setScenario] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!targetType || !targetDept || !scenario || !difficulty) {
       toast.error("Please complete all matrix selections.");
       return;
    }

    setIsAssigning(true);
    try {
      // Mock API allocation logic
      await new Promise(res => setTimeout(res, 1200));
      toast.success(`Allocated ${scenario} (${difficulty}) to all ${targetType}s in ${targetDept}.`);
      setTargetType("");
      setTargetDept("");
      setScenario("");
      setDifficulty("");
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
                  <label className="text-sm font-medium text-gray-700">Scenario Selection</label>
                  <Select value={scenario} onValueChange={setScenario}>
                     <SelectTrigger className="w-full bg-gray-50">
                        <SelectValue placeholder="Choose a scenario..." />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="Angry Patient">Angry Patient</SelectItem>
                        <SelectItem value="Overcharged Patient">Overcharged Patient</SelectItem>
                        <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                        <SelectItem value="Emergency Code Blue">Emergency Code Blue</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                     <BarChart3 className="h-4 w-4 text-amber-500" /> Difficulty Level
                  </label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                     <SelectTrigger className="w-full bg-gray-50">
                        <SelectValue placeholder="Set difficulty..." />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="Easy">Easy (Guided)</SelectItem>
                        <SelectItem value="Medium">Medium (Standard)</SelectItem>
                        <SelectItem value="Hard">Hard (Realistic Constraints)</SelectItem>
                        <SelectItem value="Expert">Expert (Unpredictable)</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
         <div className="flex-1 space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">Rule-Based Allocation Summary</h3>
            <p className="text-gray-600">
               Staff matched by the target filters will be immediately assigned the <span className="font-semibold text-gray-800">{scenario || "..."}</span> scenario at <span className="font-semibold text-gray-800">{difficulty || "..."}</span> difficulty.
            </p>
         </div>
         <Button 
            size="lg" 
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
            onClick={handleAssign}
            disabled={isAssigning || !targetType || !targetDept || !scenario || !difficulty}
         >
            {isAssigning ? <Loader2 className="h-4 w-4 animate-spin"/> : <Zap className="h-4 w-4" />}
            Execute Assignment logic
         </Button>
      </div>
    </div>
  );
}
