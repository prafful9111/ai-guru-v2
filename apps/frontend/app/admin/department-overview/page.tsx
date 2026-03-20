"use client";

import React, { Suspense } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { CommandCenterHeader } from "@/components/admin/command-center-header";
import { UnitPerformanceSummary } from "@/components/admin/unit-performance-summary";
import { UnitCompletionRoster } from "@/components/admin/unit-completion-roster";
import { UnitTopPerformersWidget } from "@/components/admin/unit-top-performers-widget";
import { Target, Users, Award } from "lucide-react";

export default function DepartmentOverviewPage() {
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
        title="Department Overview"
        description="Unified insights for Unit Heads on compliance, strengths, and top performers."
      />
      
      <main className="w-full mx-auto pb-12">
        <CommandCenterHeader />
        
        <div className="px-4 md:px-8 space-y-8 animate-in fade-in duration-500 mt-2">
           
           {/* Section 1: Leadership Board Mini Integration (Unit Top Performers) */}
           <section className="space-y-3 w-full">
              <div className="flex items-center gap-2 px-1">
                 <Award className="h-4 w-4 text-slate-500" />
                 <h2 className="text-[15px] font-semibold text-slate-800">Unit Top Performers</h2>
              </div>
              <Suspense fallback={<div className="h-32 flex items-center justify-center text-slate-400">Loading top performers...</div>}>
                 <UnitTopPerformersWidget />
              </Suspense>
           </section>

           {/* Section 2: Performance Summary (Strengths & Action Areas) */}
           <section className="space-y-3 w-full">
              <div className="flex items-center gap-2 px-1">
                 <Target className="h-4 w-4 text-slate-500" />
                 <h2 className="text-[15px] font-semibold text-slate-800">Strengths & Action Areas</h2>
              </div>
              <UnitPerformanceSummary />
           </section>

           {/* Section 3: Completion Roster (Compliance Tracking) */}
           <section className="space-y-3 w-full">
              <div className="flex items-center gap-2 px-1">
                 <Users className="h-4 w-4 text-slate-500" />
                 <h2 className="text-[15px] font-semibold text-slate-800">Compliance Tracking</h2>
              </div>
              <UnitCompletionRoster />
           </section>
           
        </div>
      </main>
    </AdminLayoutShell>
  );
}
