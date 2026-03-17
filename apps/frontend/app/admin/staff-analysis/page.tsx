"use client";

import React, { useState, useMemo } from "react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Users, Activity, AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Filter } from "lucide-react";
import { useSessionReports, useFilters } from "@/lib/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StaffAssessmentHub } from "@/components/admin/staff-assessment-hub";
import { StaffAnalyticsVisuals } from "@/components/admin/staff-analytics-visuals";
import { GamificationLeaderboard } from "@/components/admin/gamification-leaderboard";

export default function StaffAnalysisPage() {
  const router = useRouter();
  const { signout } = useAuth();

  // We fetch page 1 with 0 limits just to hit the endpoint for the aggregate stats structure
  const { data, isLoading } = useSessionReports(1, 10, "", {});
  const stats = data?.stats;

  // Global Filter State & API calls
  const { data: filterHierarchy } = useFilters();
  const [unit, setUnit] = useState("");
  const [dept, setDept] = useState("");
  const [region, setRegion] = useState("");
  const [role, setRole] = useState("");

  const availableUnits = useMemo(() => {
    if (!filterHierarchy) return [];
    const units = new Set<string>();
    filterHierarchy.forEach((city: any) => {
      city.units?.forEach((u: any) => units.add(u.name));
    });
    return Array.from(units).sort();
  }, [filterHierarchy]);

  const availableDepartments = useMemo(() => {
    if (!filterHierarchy) return [];
    const depts = new Set<string>();
    filterHierarchy.forEach((city: any) => {
      city.units?.forEach((u: any) => {
        u.departments?.forEach((d: string) => depts.add(d));
      });
    });
    return Array.from(depts).sort();
  }, [filterHierarchy]);

  const availableCities = useMemo(() => {
    if (!filterHierarchy) return [];
    return filterHierarchy.map((city: any) => city.name).sort();
  }, [filterHierarchy]);

  const handleLogout = async () => {
    await signout();
    router.push("/auth/login");
  };

  const filterComponents = (
    <div className="flex flex-wrap items-center justify-end gap-2 w-full">
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger className="h-8 text-xs bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-full px-4 font-medium transition-colors w-auto min-w-[120px] shadow-none"><SelectValue placeholder="All Regions" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {availableCities.map((c: string) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={unit} onValueChange={setUnit}>
        <SelectTrigger className="h-8 text-xs bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-full px-4 font-medium transition-colors w-auto min-w-[110px] shadow-none"><SelectValue placeholder="All Units" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Units</SelectItem>
          {availableUnits.map((u: string) => (
            <SelectItem key={u} value={u}>{u}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={dept} onValueChange={setDept}>
        <SelectTrigger className="h-8 text-xs bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-full px-4 font-medium transition-colors w-auto min-w-[140px] shadow-none"><SelectValue placeholder="All Departments" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {availableDepartments.map((d: string) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="h-8 text-xs bg-[#2d87a4]/10 hover:bg-[#2d87a4]/20 border-none text-[#2d87a4] rounded-full px-4 font-semibold transition-colors w-auto min-w-[100px] shadow-none"><SelectValue placeholder="All Roles" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="sn">Staff Nurse</SelectItem>
          <SelectItem value="sr">Senior Resident</SelectItem>
          <SelectItem value="fc">Financial Counselor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <AdminLayoutShell>
      <AdminHeader 
        handleLogout={handleLogout}
        title="Staff Analysis"
        icon={<Users className="h-5 w-5" />}
        filters={filterComponents}
      />
      <main className="flex-1 w-full flex flex-col min-w-0">

        <div className="w-full px-4 md:px-8 py-6 space-y-6">

          {/* Executive KPI Cards Migrated Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">

            {/* Card 1: Total Sessions */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sessions</span>
                <Activity size={16} className="text-blue-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <>
                    <div className="text-2xl font-semibold text-slate-800">{stats?.total || 0}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Aggregated platform wide</div>
                  </>
                )}
              </div>
            </div>

            {/* Card 2: Green Category */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Green</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <div className="flex items-end justify-between">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-semibold text-slate-800">{stats?.green || 0}</div>
                )}
              </div>
            </div>

            {/* Card 3: Amber Category */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Amber</span>
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div className="flex items-end justify-between">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-semibold text-slate-800">{stats?.amber || 0}</div>
                )}
              </div>
            </div>

            {/* Card 4: Red Category */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px] relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-400"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Red</span>
                <XCircle size={16} className="text-rose-500" />
              </div>
              <div className="flex items-end justify-between">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-semibold text-slate-800">{stats?.red || 0}</div>
                )}
              </div>
            </div>

          </div>

          {/* Aggregated Visual Analytics Layer */}
          <StaffAnalyticsVisuals />

          {/* Gamification Action Leaderboards */}
          <GamificationLeaderboard />

          {/* Core Hub Component */}
          <StaffAssessmentHub />

        </div>
      </main>
    </AdminLayoutShell>
  );
}
