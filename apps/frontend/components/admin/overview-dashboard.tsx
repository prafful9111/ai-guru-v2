"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Clock,
  AlertTriangle,
  Activity,
  Filter,
  Mail,
  BellRing,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useFilters, useScenariosList } from "@/lib/hooks/use-dashboard";
import { AdminHeader } from "./admin-header";

// --- Mock Data ---

const MOCK_TRIAGE_DATA = [
  {
    id: "1",
    name: "Rahul Sharma",
    empCode: "EMP101",
    role: "Staff Nurse",
    unit: "ICU - Main",
    department: "Critical Care",
    reason: "D+10: No Assessment Taken",
    lastAssessed: "N/A",
    score: "-",
    type: "d10"
  },
  {
    id: "2",
    name: "Priya Singh",
    empCode: "EMP205",
    role: "Front Desk Executive",
    unit: "OPD - Ground Floor",
    department: "Patient Relations",
    reason: "Repeated Red: 3rd Attempt Failed",
    lastAssessed: "Oct 24, 2023",
    score: "4.2",
    type: "repeated_red"
  },
  {
    id: "3",
    name: "Amit Kumar",
    empCode: "EMP342",
    role: "Technician",
    unit: "Radiology",
    department: "Imaging",
    reason: "D+10: No Assessment Taken",
    lastAssessed: "N/A",
    score: "-",
    type: "d10"
  },
  {
    id: "4",
    name: "Sneha Patel",
    empCode: "EMP119",
    role: "Financial Counselor",
    unit: "Billing",
    department: "Finance",
    reason: "Repeated Red: 3rd Attempt Failed",
    lastAssessed: "Oct 22, 2023",
    score: "3.8",
    type: "repeated_red"
  }
];

const MOCK_UNIT_PERFORMANCE = [
  { id: "u1", name: "Intensive Care Unit (ICU)", manager: "Dr. A. Sharma", total: 156, green: 42, amber: 23, red: 35, avgScore: 6.8, trend: "down" },
  { id: "u2", name: "Emergency Department", manager: "Dr. R. Verma", total: 210, green: 55, amber: 15, red: 30, avgScore: 7.2, trend: "up" },
  { id: "u3", name: "Billing & Registration", manager: "S. Gupta", total: 85, green: 65, amber: 15, red: 20, avgScore: 8.1, trend: "up" },
  { id: "u4", name: "Outpatient Dept (OPD)", manager: "Dr. N. Patel", total: 340, green: 78, amber: 12, red: 10, avgScore: 8.9, trend: "up" },
  { id: "u5", name: "Radiology", manager: "Dr. K. Iyer", total: 64, green: 80, amber: 15, red: 5, avgScore: 9.2, trend: "neutral" },
];

interface OverviewDashboardProps {
  handleLogout: () => void;
}

export const OverviewDashboard = ({ handleLogout }: OverviewDashboardProps) => {
  const router = useRouter();

  // Connect API hooks
  const { data: filterHierarchy } = useFilters();
  const { data: scenariosList } = useScenariosList();

  // Extract globally unique Units and Departments
  const availableUnits = useMemo(() => {
    if (!filterHierarchy) return [];
    const units = new Set<string>();
    filterHierarchy.forEach((city: any) => {
      city.units?.forEach((unit: any) => units.add(unit.name));
    });
    return Array.from(units).sort();
  }, [filterHierarchy]);

  const availableDepartments = useMemo(() => {
    if (!filterHierarchy) return [];
    const depts = new Set<string>();
    filterHierarchy.forEach((city: any) => {
      city.units?.forEach((unit: any) => {
        unit.departments?.forEach((dept: string) => depts.add(dept));
      });
    });
    return Array.from(depts).sort();
  }, [filterHierarchy]);

  // Global Controls
  const [unit, setUnit] = useState("");
  const [dept, setDept] = useState("");
  const [scenario, setScenario] = useState("");
  const [dateRange, setDateRange] = useState("");

  const handleUnitRowClick = (unitName: string) => {
    console.log("Navigating to filtered sessions for unit:", unitName);
  };

  const filterComponents = (
    <div className="flex flex-wrap items-center justify-end gap-2 w-full">
      <Select value={unit} onValueChange={setUnit}>
        <SelectTrigger className="h-8 text-xs bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-full px-4 font-medium transition-colors w-auto min-w-[110px] shadow-none"><SelectValue placeholder="All Units" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Units</SelectItem>
          {availableUnits.map((u) => (
            <SelectItem key={u} value={u}>{u}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={dept} onValueChange={setDept}>
        <SelectTrigger className="h-8 text-xs bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-full px-4 font-medium transition-colors w-auto min-w-[140px] shadow-none"><SelectValue placeholder="All Departments" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {availableDepartments.map((d) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={scenario} onValueChange={setScenario}>
        <SelectTrigger className="h-8 text-xs bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-full px-4 font-medium transition-colors w-auto min-w-[130px] shadow-none"><SelectValue placeholder="All Scenarios" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Scenarios</SelectItem>
          {scenariosList?.map((s: any) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="h-8 text-xs bg-[#2d87a4]/10 hover:bg-[#2d87a4]/20 border-none text-[#2d87a4] rounded-full px-4 font-semibold transition-colors w-auto min-w-[120px] shadow-none"><SelectValue placeholder="Time Range" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="custom">Custom Range...</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="w-full flex flex-col">

      <AdminHeader 
        handleLogout={handleLogout}
        title="Overview Dashboard"
        icon={<Activity className="h-5 w-5" />}
        filters={filterComponents}
      />

      <div className="w-full px-4 md:px-8 py-6 space-y-6">
        {/* 2. Top Row: Executive KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1: Total Staff Trained */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Uploaded</span>
              <Users size={16} className="text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800">1,245</div>
              <div className="text-[10px] text-slate-400 mt-1">Participants added to system</div>
            </div>
          </div>

          {/* Card 2: Pending Assessments */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Sessions</span>
              <Clock size={16} className="text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800">156</div>
              <div className="text-[10px] text-slate-400 mt-1">Yet to login & start</div>
            </div>
          </div>

          {/* Card 3: System Health (RAG Status) */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">System Health</span>
              <Activity size={16} className="text-emerald-500" />
            </div>

            <div className="space-y-2 mt-auto">
              <div className="h-1.5 w-full rounded-sm overflow-hidden flex bg-slate-100">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: '65%' }}></div>
                <div className="bg-amber-400 h-full transition-all" style={{ width: '20%' }}></div>
                <div className="bg-rose-500 h-full transition-all" style={{ width: '15%' }}></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>65% Green</span>
                <span>20% Amber</span>
                <span>15% Red</span>
              </div>
            </div>
          </div>

          {/* Card 4: Pending Escalations */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-[110px] relative overflow-hidden">
            {/* Subtle red bottom border indicator for emphasis instead of full background */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-400"></div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700">Pending Escalations</span>
              <AlertTriangle size={16} className="text-rose-500" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-semibold text-slate-800">42</div>
              <div className="text-right flex flex-col justify-end pb-0.5">
                <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> 18 at D+7
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> 24 at D+10
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">

          {/* 3. Action Required: Triage & Escalations */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[400px]">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  Action Required: Triage
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-medium border-rose-200 text-rose-700 bg-rose-50/50">
                {MOCK_TRIAGE_DATA.length} Critical
              </Badge>
            </div>
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="sticky top-0 bg-white z-10 shadow-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-slate-200">
                  <tr className="text-slate-500 bg-slate-50">
                    <th className="font-semibold py-3 px-4 w-[280px]">Participant</th>
                    <th className="font-semibold py-3 px-4 w-[200px]">Location</th>
                    <th className="font-semibold py-3 px-4">Flag Reason</th>
                    <th className="font-semibold py-3 px-4 text-center">Score</th>
                    <th className="font-semibold py-3 px-4">Last Assessment</th>
                    <th className="font-semibold py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_TRIAGE_DATA.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.empCode} • {item.role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">{item.unit}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'repeated_red' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                          <span className="text-slate-700 font-medium">{item.reason}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${item.score === '-' ? 'text-slate-400' : 'text-rose-600'}`}>{item.score}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600">{item.lastAssessed}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.type === 'd10' ? (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 shadow-none text-slate-600">
                              Email Unit Head
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 shadow-none text-slate-600">
                              Notify HR
                            </Button>
                          )}
                          <Button size="sm" variant="secondary" className="h-6 text-[10px] px-2 shadow-none">
                            Override
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Unit Performance (RAG) Data Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[400px]">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  Unit Performance (RAG)
                </h3>
              </div>
              <div className="text-[10px] text-slate-400">Sorted by Red %</div>
            </div>
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="sticky top-0 bg-white z-10 shadow-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-slate-200">
                  <tr className="text-slate-500 bg-slate-50">
                    <th className="font-semibold py-3 px-4 w-[280px]">Unit Name</th>
                    <th className="font-semibold py-3 px-4 w-[200px]">Manager</th>
                    <th className="font-semibold py-3 px-4 text-center">Total Assess.</th>
                    <th className="font-semibold py-3 px-4 text-center text-emerald-600">Green %</th>
                    <th className="font-semibold py-3 px-4 text-center text-amber-600">Amber %</th>
                    <th className="font-semibold py-3 px-4 text-center text-rose-600">Red %</th>
                    <th className="font-semibold py-3 px-4 text-center">Avg Score</th>
                    <th className="font-semibold py-3 px-4 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_UNIT_PERFORMANCE.sort((a, b) => b.red - a.red).map((unit) => (
                    <tr
                      key={unit.id}
                      onClick={() => handleUnitRowClick(unit.name)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{unit.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-600">{unit.manager}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-slate-700">{unit.total}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-emerald-600">{unit.green}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-amber-500">{unit.amber}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-rose-600">{unit.red}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-slate-800">{unit.avgScore.toFixed(1)} <span className="text-[10px] text-slate-400 font-medium">/ 10</span></span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`inline-flex items-center gap-1 font-bold ${
                          unit.trend === 'up' ? 'text-emerald-500' :
                          unit.trend === 'down' ? 'text-rose-500' : 'text-slate-400'
                        }`}>
                          {unit.trend === 'up' && '↑'}
                          {unit.trend === 'down' && '↓'}
                          {unit.trend === 'neutral' && '→'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
