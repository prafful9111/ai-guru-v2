"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { StaffManagementDashboard } from "@/components/admin/staff-management-dashboard";

export default function UsersPage() {
  const router = useRouter();
  const { signout } = useAuth();

  const handleLogout = () => {
    signout();
    router.push("/auth/login");
  };

  return (
    <AdminLayoutShell>
      <AdminHeader handleLogout={handleLogout} />
      <main className="max-w-7xl w-full mx-auto p-4 md:p-8 pt-4">
         <StaffManagementDashboard />
      </main>
    </AdminLayoutShell>
  );
}
