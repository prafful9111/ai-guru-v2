"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  ArrowRight,
  Lock,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { signin, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await signin(adminId, adminPass);
      if (data && data.role.toLowerCase() === "admin") {
        router.push("/admin/dashboard");
      } else {
        setError("You are not authorized to access this page");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
      {/* Header Section */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center mb-6">
          <Logo size="lg" className="scale-125" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Simulation Training Portal
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Secure access for administrative management.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 max-w-md w-full text-center">
          {error}
        </div>
      )}

      {/* Login Cards Container */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg items-stretch justify-center">
        <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800"></div>
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Management Dashboard
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Administrative access for performance monitoring and analytics.
            </p>

            <form
              onSubmit={handleAdminSubmit}
              className="space-y-4 flex-1 flex flex-col"
            >
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Admin ID
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all"
                    placeholder="Enter Admin ID"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  type="submit"
                  className={`w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group/btn ${loading ? "opacity-50" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />{" "}
                      Accessing...
                    </>
                  ) : (
                    <>
                      Access Dashboard{" "}
                      <ArrowRight
                        size={18}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-400">
                    Login as{" "}
                    <Link
                      href="/auth/login"
                      className="text-[#2d87a4] font-semibold"
                    >
                      Staff
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
