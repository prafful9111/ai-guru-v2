"use client";

import React, { Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { StaffProfileView } from "@/components/admin/staff-profile-view";
import { CommandCenterHeader } from "@/components/admin/command-center-header";

export default function StaffProfilePage() {
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
        title="Staff Profile"
        description="Individual assessment journey, scenario portfolio, and audit trail."
      />
      
      <main className="w-full mx-auto pb-12">
        <CommandCenterHeader />
        
        <div className="px-4 md:px-8 mt-2 animate-in fade-in duration-500">
           <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading staff profile...</div>}>
             <StaffProfileView />
           </Suspense>
        </div>
      </main>
    </AdminLayoutShell>
  );
}
