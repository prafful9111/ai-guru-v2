"use client";

import React, { Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { LeadershipBoardTab } from "@/components/admin/leadership-board-tab";
import { CommandCenterHeader } from "@/components/admin/command-center-header";

export default function LeadershipPage() {
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
        title="Leadership Board"
        description="Gamified insights into top-performing units and individual excellence."
      />
      
      <main className="w-full mx-auto pb-12">
        <CommandCenterHeader />
        
        <div className="px-4 md:px-8 mt-2 animate-in fade-in duration-500">
           <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading leadership board...</div>}>
             <LeadershipBoardTab />
           </Suspense>
        </div>
      </main>
    </AdminLayoutShell>
  );
}
