"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Stethoscope,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Logo } from "../../../components/logo";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPass, setStaffPass] = useState("");
  const [staffError, setStaffError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signin, loading } = useAuth();
  const router = useRouter();

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");

    try {
      const data = await signin(staffEmail, staffPass);
      if (
        data &&
        (data.role.toLowerCase() === "staff" ||
          data.role.toLowerCase() === "admin")
      ) {
        router.push("/");
      } else {
        setStaffError("You are not authorized to access this page");
      }
    } catch (error: any) {
      console.error("Login failed", error);
      setStaffError(error.message || "Login failed");
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
          SOP Training Portal
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Login to begin your SOP Assessment Journey.
        </p>
      </div>

      {/* Login Cards Container */}
      {/* Staff Login Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2d87a4]"></div>
        <div className="p-6 md:p-8 flex flex-col h-full">
          <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-[#2d87a4] mb-6 group-hover:scale-110 transition-transform duration-300">
            <Stethoscope size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Staff App</h2>
          <p className="text-sm text-slate-500 mb-4">
            Login to access simulation scenarios and training modules.
          </p>

          {staffError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {staffError}
            </div>
          )}

          <form
            onSubmit={handleStaffSubmit}
            className="space-y-4 flex-1 flex flex-col"
          >
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Phone Number or Staff ID
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2d87a4]/20 focus:border-[#2d87a4] transition-all"
                  placeholder="Enter Phone Number or Staff ID"
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
                  value={staffPass}
                  onChange={(e) => setStaffPass(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2d87a4]/20 focus:border-[#2d87a4] transition-all"
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
                disabled={loading}
                className={`w-full py-3.5 bg-[#2d87a4] hover:bg-[#236c84] text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/10 hover:shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed ${loading ? "opacity-50" : ""}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Log in
                    <ArrowRight
                      size={18}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-400">
                  Login to{" "}
                  <Link
                    href="/admin/auth/login"
                    className="text-[#2d87a4] font-semibold"
                  >
                    Admin Panel
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-slate-400">
          © 2026 AI Guru Platform by Figital Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
