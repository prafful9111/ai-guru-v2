"use client";

import React, { useState } from "react";
import { LogoutConfirmModal } from "@/components/logout-confirm-modal";
import { useRouter } from "next/navigation";
import { LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/logo";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export default function AdminPage() {
  const router = useRouter();
  const { signout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await signout();
    router.push("/auth/login");
  };

  return (
    <AdminLayoutShell>
      <div className="flex flex-col items-center justify-center p-6 text-center h-[calc(100vh-100px)]">
        <div className="mb-6 md:hidden">
          <Logo size="lg" />
        </div>
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full mt-10 md:mt-0">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <BarChart3 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Management Dashboard
          </h1>
          <p className="text-slate-500 mb-8">
            This module is currently under development. Please check back later
            for analytics and staff performance tracking.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 mx-auto transition-all"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </div>
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </AdminLayoutShell>
  );
}

