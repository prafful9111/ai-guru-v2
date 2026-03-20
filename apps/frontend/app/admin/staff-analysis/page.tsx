"use client";

import React, { useState, Suspense } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { CommandCenterHeader } from "@/components/admin/command-center-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Target, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TrainingNeedsTab } from "@/components/admin/training-needs-tab";
import { EmployeeJourneyTab } from "@/components/admin/employee-journey-tab";

export default function StaffAnalysisPage() {
  const router = useRouter();
  const { signout } = useAuth();
  
  const handleLogout = () => {
    signout();
    router.push("/auth/login");
  };

  return (
    <AdminLayoutShell>
      <AdminHeader 
        handleLogout={handleLogout} 
        title="Staff Analytics"
        description="Identify systemic training gaps and review individual employee records."
      />
      
      <main className="w-full mx-auto pb-12">
        <CommandCenterHeader />
        
        <div className="px-4 md:px-8 animate-in fade-in duration-500">
          <Tabs defaultValue="training-needs" className="w-full">
            <TabsList className="grid w-full lg:max-w-[500px] grid-cols-2 mb-8">
              <TabsTrigger value="training-needs" className="flex items-center gap-2">
                 <Target className="h-4 w-4" />
                 <span className="hidden sm:inline">Training Need Identification</span>
              </TabsTrigger>
              <TabsTrigger value="employee-journey" className="flex items-center gap-2">
                 <Users className="h-4 w-4" />
                 <span className="hidden sm:inline">Staff Journey (360 View)</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="training-needs" className="space-y-4 m-0 outline-none">
               <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading metrics...</div>}>
                 <TrainingNeedsTab />
               </Suspense>
            </TabsContent>

            <TabsContent value="employee-journey" className="space-y-4 m-0 outline-none">
               <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading metrics...</div>}>
                 <EmployeeJourneyTab />
               </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AdminLayoutShell>
  );
}
