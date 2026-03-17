"use client";

import React from "react";
import { Logo } from "@/components/logo";
import { LogOut, Filter as FilterIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  handleLogout: () => void;
  title?: string;
  icon?: React.ReactNode;
  filters?: React.ReactNode;
}

export const AdminHeader = ({ handleLogout, title, icon, filters }: AdminHeaderProps) => {
  const pathname = usePathname();
  const isUsersPage = pathname.startsWith("/admin/users");
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  return (
    <div className="shrink-0 flex flex-col z-30 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Primary Top Bar */}
      <header className="bg-white px-4 md:px-8 h-[73px] flex items-center justify-between border-b border-slate-200">
        {/* Left Side: Mobile Logo & Desktop Page Title */}
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <Link href="/admin/dashboard" className="md:hidden">
            <Logo size="md" />
          </Link>
          
          {title && (
            <div className="hidden md:flex items-center gap-2 text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-tight shrink-0">
              <div className="text-[#2d87a4] flex items-center justify-center">
                 {icon}
              </div>
              {title}
            </div>
          )}
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {filters && (
            <button
               onClick={() => setIsFiltersOpen(!isFiltersOpen)}
               className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                 isFiltersOpen 
                  ? 'bg-[#2d87a4]/10 text-[#2d87a4] border-[#2d87a4]/20 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
               }`}
               title="Toggle Filters"
            >
              <FilterIcon size={14} className={isFiltersOpen ? "text-[#2d87a4]" : ""} />
              Filters
              {isFiltersOpen ? <ChevronUp size={14} className="opacity-70 text-[#2d87a4]" /> : <ChevronDown size={14} className="opacity-70" />}
            </button>
          )}
          
          {!isUsersPage && (
            <Link
              href={"/admin/users"}
              className="border w-fit px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-muted font-medium text-slate-600 hover:text-slate-800 transition-colors text-xs"
            >
              View / Create Users
            </Link>
          )}
          <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] md:text-xs shadow-sm">
              AD
            </div>
            <div className="text-sm hidden xs:block">
              <div className="font-bold text-slate-800 leading-none text-[10px] md:text-xs">
                Admin User
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Secondary Filter Bar (Collapsible) */}
      {filters && (
        <div 
          className={`w-full bg-white border-b border-slate-200 px-4 md:px-8 transition-all duration-300 overflow-hidden ${
            isFiltersOpen ? 'max-h-[100px] py-3 opacity-100 shadow-sm' : 'max-h-0 py-0 opacity-0 border-transparent'
          }`}
        >
          <div className="w-full flex md:items-center justify-between">
            {/* If a mobile title exists, we could render it here. For now, filters take full width. */}
            <div className="flex-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0 flex justify-end w-full">
               {filters}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
