"use client";

import React, { useState } from "react";
import { StatusFunnel } from "./status-funnel";
import { EscalationMatrix } from "./escalation-matrix";
import { Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AssessmentMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("funnel");

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assessment Monitoring</h1>
          <p className="text-sm text-gray-500">
            High-level pulse check of organization compliance and escalation tracking.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full lg:max-w-[400px] grid-cols-2">
          <TabsTrigger value="funnel" className="flex items-center gap-2">
             <Layers className="h-4 w-4" />
             <span className="hidden sm:inline">Status Funnel</span>
          </TabsTrigger>
          <TabsTrigger value="escalation" className="flex items-center gap-2">
             <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
             </span>
             <span className="hidden sm:inline">Escalation Matrix</span>
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="funnel" className="m-0 focus-visible:outline-none focus-visible:ring-0">
             <StatusFunnel />
          </TabsContent>
          <TabsContent value="escalation" className="m-0 focus-visible:outline-none focus-visible:ring-0">
             <EscalationMatrix />
          </TabsContent>
        </div>
      </Tabs>
      
    </div>
  );
}
