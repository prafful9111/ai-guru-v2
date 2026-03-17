"use client";

import React from "react";
import { AdminSidebar } from "./admin-sidebar";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  headerTitle?: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerFilters?: React.ReactNode;
}

export const AdminLayoutShell = ({ 
  children, 
  headerTitle, 
  headerIcon, 
  headerFilters 
}: AdminLayoutShellProps) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {/* Navbar moved inside here so it can accept page-specific props easily if we refactored, but currently AdminHeader is rendered in the pages themselves. 
            Wait, looking at dashboard/page.tsx, AdminHeader is rendered INSIDE the page, not inside AdminLayoutShell.
            Let me check Dashboard page again.
        */}
        {children}
      </div>
    </div>
  );
};
