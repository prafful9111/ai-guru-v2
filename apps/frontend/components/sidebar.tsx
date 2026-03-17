import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, BrainCircuit, FileText, Menu, X } from "lucide-react";
import { LogoutConfirmModal } from "./logout-confirm-modal";
import { Logo } from "./logo";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    onLogout?.();
    setShowLogoutConfirm(false);
    setIsOpen(false);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />

      {/* --- MOBILE NAVIGATION --- */}
      <div className="md:hidden">
        {/* Mobile Persistent Header */}
        <div className="sticky top-0 inset-x-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-120 shadow-sm transition-all duration-300">
          <Logo size="md" />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 hover:text-[#2d87a4] hover:bg-slate-50 rounded-xl transition-all active:scale-95"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-100 transition-opacity duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Mobile Top Drawer */}
        <aside
          className={`fixed inset-x-0 top-0 bg-white z-110 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col shadow-2xl rounded-b-[2.5rem] pt-16 ${isOpen ? "translate-y-0" : "-translate-y-full"}`}
        >
          {/* Nav Links */}
          <nav className="px-6 pb-4 space-y-2 mt-4">
            <MobileSidebarLink
              href="/"
              icon={<LayoutGrid size={18} />}
              label="Dashboard"
              active={pathname === "/"}
              onClick={() => setIsOpen(false)}
            />
            <MobileSidebarLink
              href="/attempts"
              icon={<FileText size={18} />}
              label="Attempts"
              active={pathname === "/attempts"}
              onClick={() => setIsOpen(false)}
            />
          </nav>

          {/* Drawer Footer */}
          <div className="p-6 pt-0 flex flex-col items-center gap-6">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#2d87a4] hover:bg-[#246d84] text-white rounded-2xl font-semibold text-sm uppercase tracking-widest transition-all shadow-xl shadow-cyan-900/20 active:scale-[0.97]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className="fixed left-0 top-0 h-dvh w-20 bg-white border-r border-slate-100 flex-col items-center py-6 z-50 hidden md:flex"
      >
        <div className="mb-10 flex items-center justify-center text-[#2d87a4] hover:scale-110 transition-transform">
          <BrainCircuit size={32} strokeWidth={1.5} />
        </div>

        <nav className="flex-1 w-full flex flex-col items-center gap-4">
          <DesktopSidebarLink
            href="/"
            icon={<LayoutGrid size={22} />}
            label="Dashboard"
            active={pathname === "/"}
          />
          <DesktopSidebarLink
            href="/attempts"
            icon={<FileText size={22} />}
            label="Attempts"
            active={pathname === "/attempts"}
          />
        </nav>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogoutClick}
              className="mb-4 text-red-500 transition-all p-3 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white shadow-sm active:scale-95"
            >
              <LogOut size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Logout</TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  );
};

// --- HELPER COMPONENTS ---

const MobileSidebarLink = ({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-4 p-0 rounded-2xl transition-all group ${active ? 'bg-slate-50' : 'hover:bg-slate-50/50'
      }`}
  >
    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${active
      ? 'bg-[#2d87a4] text-white shadow-[0_8px_16px_-4px_rgba(45,135,164,0.3)]'
      : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
      }`}>
      {icon}
    </div>
    <span className={`font-semibold text-base tracking-tight transition-colors ${active ? 'text-slate-800' : 'text-slate-500'
      }`}>
      {label}
    </span>
  </Link>
);

const DesktopSidebarLink = ({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link href={href}>
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 
          ${active
              ? "bg-[#2d87a4] text-white shadow-md shadow-cyan-900/10"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
        >
          {icon}
        </div>
      </Link>
    </TooltipTrigger>
    <TooltipContent side="right" className="font-medium">
      {label}
    </TooltipContent>
  </Tooltip>
);

