"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/logo";

export const AdminSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      label: "Assessment Monitoring",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Staff Analysis",
      href: "/admin/staff-analysis",
      icon: Users,
    },
  ];

  return (
    <aside className={`bg-white border-r border-slate-200 h-screen sticky top-0 hidden md:flex flex-col transition-all duration-300 relative z-40 ${isCollapsed ? 'w-[80px]' : 'w-64'}`}>
      <div className="p-4 border-b border-slate-200 h-[73px] flex items-center justify-center">
        <Link href="/admin/dashboard" className="flex items-center justify-center">
          {isCollapsed ? (
             <div className="font-bold text-slate-800 text-xl tracking-tighter flex items-center select-none">AI<span className="text-[#2d87a4] font-normal">G</span></div>
          ) : (
             <Logo size="md" />
          )}
        </Link>
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-[36.5px] -translate-y-1/2 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center rounded-full shadow-sm w-7 h-7 transition-colors z-30"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-slate-50 text-[#2d87a4] font-semibold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className={isActive ? "text-[#2d87a4]" : "text-slate-400"} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};
