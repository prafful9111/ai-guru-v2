"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { CommandCenterHeader } from "@/components/admin/command-center-header";
import { StatusFunnel } from "@/components/admin/status-funnel";
import { EscalationMatrix } from "@/components/admin/escalation-matrix";
import { Layers, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
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
        title="Overview "
        description="Monitor completion, escalations, and staff performance."
      />
      
      {/* 
        Unified Command Center Layout 
        Removed max-w constraint to use full width.
      */}
      <main className="w-full mx-auto pb-12">
        <CommandCenterHeader />
        
        <div className="px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full lg:max-w-[400px] grid-cols-2 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                 <Layers className="h-4 w-4" />
                 <span className="hidden sm:inline">Overview & Status</span>
              </TabsTrigger>
              <TabsTrigger value="escalations" className="flex items-center gap-2">
                 <AlertTriangle className="h-4 w-4 text-rose-500" />
                 <span className="hidden sm:inline">Escalations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 m-0">
               <StatusFunnel />
            </TabsContent>

            <TabsContent value="escalations" className="space-y-4 m-0">
               <EscalationMatrix />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AdminLayoutShell>
  );
}
