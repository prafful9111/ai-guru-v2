"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutConfirmModal } from "@/components/logout-confirm-modal";
import { AdminStaffStats, AdminScenarioStats } from "@/types";
import { useAuth } from "@/context/auth-context";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { OverviewDashboard } from "@/components/admin/overview-dashboard";
import { SessionReportsTable } from "@/components/admin/session-reports-table";

type Tab = "staff" | "scenarios" | "city" | "department" | "unit";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("staff");
  const [hasLoadedTab, setHasLoadedTab] = useState(false);
  const { signout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  // Sorting state (Client-side)
  const [staffSort, setStaffSort] = useState<{
    key: string;
    order: "asc" | "desc";
  }>({ key: "name", order: "asc" });
  const [scenarioSort, setScenarioSort] = useState<{
    key: string;
    order: "asc" | "desc";
  }>({ key: "title", order: "asc" });

  // Filter state
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [appliedCity, setAppliedCity] = useState<string>("");
  const [appliedDept, setAppliedDept] = useState<string>("");
  const [appliedUnit, setAppliedUnit] = useState<string>("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // const { data: filterHierarchy, isLoading: filtersLoading } = useFilters();

  // Handle initial tab from localStorage
  React.useEffect(() => {
    const savedTab = localStorage.getItem("admin_active_tab") as Tab;
    if (
      savedTab &&
      ["staff", "scenarios", "city", "department", "unit"].includes(savedTab)
    ) {
      setActiveTab(savedTab);
    }
    setHasLoadedTab(true);
  }, []);

  // Save tab to localStorage when it changes
  React.useEffect(() => {
    if (hasLoadedTab) {
      localStorage.setItem("admin_active_tab", activeTab);
    }
  }, [activeTab, hasLoadedTab]);

  // const { data: staffResponse, isLoading: staffsLoading } = useStaffs(staffPage, pageSize, debouncedSearch, {
  //     city: appliedCity,
  //     department: appliedDept,
  //     unit: appliedUnit
  // });
  // const { data: scenarioResponse, isLoading: scenariosLoading } = useScenarios(scenarioPage, pageSize, debouncedSearch);

  // const staffs = staffResponse?.data || [];
  // const staffMeta = staffResponse?.meta;

  // const scenarios = scenarioResponse?.data || [];
  // const scenarioMeta = scenarioResponse?.meta;

  // Client-side sorting logic
  // const sortedStaffs = React.useMemo(() => {
  //     if (!staffs) return [];
  //     return [...staffs].sort((a: any, b: any) => {
  //         const valA = a[staffSort.key];
  //         const valB = b[staffSort.key];

  //         if (typeof valA === 'string' && typeof valB === 'string') {
  //             return staffSort.order === 'asc'
  //                 ? valA.localeCompare(valB)
  //                 : valB.localeCompare(valA);
  //         }

  //         return staffSort.order === 'asc'
  //             ? (valA > valB ? 1 : -1)
  //             : (valB > valA ? 1 : -1);
  //     });
  // }, [staffs, staffSort]);

  // const sortedScenarios = React.useMemo(() => {
  //     if (!scenarios) return [];
  //     let filtered = [...scenarios];

  //     // Scenarios might have 'departments' array. We filter if any selectedDept is in it.
  //     if (selectedDept) {
  //         filtered = filtered.filter((s: any) => s.departments?.includes(selectedDept));
  //     }

  //     return filtered.sort((a: any, b: any) => {
  //         const valA = a[scenarioSort.key];
  //         const valB = b[scenarioSort.key];

  //         if (typeof valA === 'string' && typeof valB === 'string') {
  //             return scenarioSort.order === 'asc'
  //                 ? valA.localeCompare(valB)
  //                 : valB.localeCompare(valA);
  //         }

  //         return scenarioSort.order === 'asc'
  //             ? (valA > valB ? 1 : -1)
  //             : (valB > valA ? 1 : -1);
  //     });
  // }, [scenarios, scenarioSort]);

//   const { data: stats, isLoading: statsLoading } = useDashboardStats();

  // --- Handlers ---
  const handleStaffClick = (staff: AdminStaffStats) => {
    router.push(`/admin/dashboard/staff/${staff.id}`);
  };

  const handleScenarioClick = (scenario: AdminScenarioStats) => {
    router.push(`/admin/dashboard/scenarios/${scenario.id}`);
  };

  /* const handleCityClick = (city: AdminCityStats) => {
        router.push(`/admin/dashboard/city/${city.id}`);
    };

    const handleDepartmentClick = (dept: any) => {
        router.push(`/admin/dashboard/department/${encodeURIComponent(dept.id)}`);
    };

    const handleUnitClick = (unit: any) => {
        router.push(`/admin/dashboard/unit/${encodeURIComponent(unit.id)}`);
    }; */

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await signout();
    router.push("/admin/auth/login");
  };

  // --- Renderers ---
  //#region Table Renderers
  // const renderStaffTable = () => {
  //     const onSort = (key: string) => {
  //         setStaffSort(prev => ({
  //             key,
  //             order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
  //         }));
  //     };

  //     return (
  //         <div className="bg-white rounded-xl shadow-none border border-slate-200 overflow-x-auto">
  //             <table className="w-full text-left border-collapse min-w-[700px]">
  //                 <thead>
  //                     <tr className="bg-slate-50/50 border-b border-slate-200">
  //                         <SortableHeader label="Staff Name" sortKey="name" currentSort={staffSort} onSort={onSort} />
  //                         <SortableHeader label="Staff ID" sortKey="staffId" currentSort={staffSort} onSort={onSort} />
  //                         <SortableHeader label="Assigned" sortKey="assigned" currentSort={staffSort} onSort={onSort} align="center" />
  //                         <SortableHeader label="Attempted" sortKey="attempted" currentSort={staffSort} onSort={onSort} align="center" />
  //                         <SortableHeader label="Passed" sortKey="passed" currentSort={staffSort} onSort={onSort} align="center" />
  //                         <SortableHeader label="Failed" sortKey="failed" currentSort={staffSort} onSort={onSort} align="center" />
  //                         <th className="py-3 px-4"></th>
  //                     </tr>
  //                 </thead>
  //                 <tbody className="divide-y divide-slate-100">
  //                     {staffsLoading ? (
  //                         Array.from({ length: 5 }).map((_, index) => (
  //                             <tr key={index} className="animate-pulse">
  //                                 <td className="py-3 px-6">
  //                                     <div className="flex items-center gap-3">
  //                                         <Skeleton className="w-8 h-8 rounded-full" />
  //                                         <div className="space-y-1">
  //                                             <Skeleton className="h-4 w-24" />
  //                                             <Skeleton className="h-3 w-16" />
  //                                         </div>
  //                                     </div>
  //                                 </td>
  //                                 <td className="py-3 px-4">
  //                                     <Skeleton className="h-3 w-12" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-right">
  //                                     <Skeleton className="h-4 w-4 ml-auto" />
  //                                 </td>
  //                             </tr>
  //                         ))
  //                     ) : sortedStaffs?.length === 0 ? (
  //                         <tr>
  //                             <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
  //                                 No records found
  //                             </td>
  //                         </tr>
  //                     ) : (
  //                         sortedStaffs?.map((staff) => (
  //                             <tr
  //                                 key={staff.id}
  //                                 onClick={() => handleStaffClick(staff)}
  //                                 className="hover:bg-slate-50/80 cursor-pointer transition-all group"
  //                             >
  //                                 <td className="py-3 px-3 md:px-6">
  //                                     <div className="flex items-center gap-3">
  //                                         <div className="w-8 h-8 rounded-full bg-cyan-50 text-[#2d87a4] flex items-center justify-center font-bold text-xs border border-cyan-100">
  //                                             {staff.name.charAt(0)}
  //                                         </div>
  //                                         <div>
  //                                             <div className="font-semibold text-slate-700 text-xs md:text-sm group-hover:text-[#2d87a4] transition-colors whitespace-nowrap">{staff.name}</div>
  //                                             <div className="text-[11px] text-slate-400">{staff.role}</div>
  //                                         </div>
  //                                     </div>
  //                                 </td>
  //                                 <td className="py-3 px-4 font-mono text-xs text-slate-500">{staff.staffId}</td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{staff.assigned}</td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-blue-600">{staff.attempted}</td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-emerald-600">{staff.passed}</td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-red-500">{staff.failed}</td>
  //                                 <td className="py-3 px-4 text-right">
  //                                     <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2d87a4] transition-colors inline-block" />
  //                                 </td>
  //                             </tr>
  //                         ))
  //                     )}
  //                 </tbody>
  //             </table>

  //             {/* Staff Pagination */}
  //             {staffMeta && staffMeta.totalPages > 1 && (
  //                 <div className="py-4 border-t border-slate-100 bg-slate-50/30 sticky bottom-0 left-0">
  //                     <Pagination>
  //                         <PaginationContent>
  //                             <PaginationItem>
  //                                 <PaginationPrevious
  //                                     onClick={() => setStaffPage(p => Math.max(1, p - 1))}
  //                                     disabled={staffPage === 1}
  //                                     className={staffPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
  //                                 />
  //                             </PaginationItem>

  //                             {Array.from({ length: staffMeta.totalPages }, (_, i) => i + 1).map((p) => {
  //                                 if (
  //                                     p === 1 ||
  //                                     p === staffMeta.totalPages ||
  //                                     (p >= staffPage - 1 && p <= staffPage + 1)
  //                                 ) {
  //                                     return (
  //                                         <PaginationItem key={p}>
  //                                             <PaginationLink
  //                                                 isActive={p === staffPage}
  //                                                 onClick={() => setStaffPage(p)}
  //                                                 className="cursor-pointer"
  //                                             >
  //                                                 {p}
  //                                             </PaginationLink>
  //                                         </PaginationItem>
  //                                     );
  //                                 } else if (p === staffPage - 2 || p === staffPage + 2) {
  //                                     return (
  //                                         <PaginationItem key={p}>
  //                                             <PaginationEllipsis />
  //                                         </PaginationItem>
  //                                     );
  //                                 }
  //                                 return null;
  //                             })}

  //                             <PaginationItem>
  //                                 <PaginationNext
  //                                     onClick={() => setStaffPage(p => Math.min(staffMeta.totalPages, p + 1))}
  //                                     disabled={staffPage === staffMeta.totalPages}
  //                                     className={staffPage === staffMeta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
  //                                 />
  //                             </PaginationItem>
  //                         </PaginationContent>
  //                     </Pagination>
  //                 </div>
  //             )}
  //         </div>
  //     );
  // };

  // const renderScenarioTable = () => {
  //     const onSort = (key: string) => {
  //         setScenarioSort(prev => ({
  //             key,
  //             order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
  //         }));
  //     };

  //     return (
  //         <div className="bg-white rounded-xl shadow-none border border-slate-200 overflow-x-auto">
  //             <table className="w-full text-left border-collapse min-w-[700px]">
  //                 <thead>
  //                     <tr className="bg-slate-50/50 border-b border-slate-200">
  //                         <SortableHeader label="Scenario Name" sortKey="title" currentSort={scenarioSort} onSort={onSort} />
  //                         <SortableHeader label="Staff Assigned" sortKey="assignedCount" currentSort={scenarioSort} onSort={onSort} align="center" />
  //                         <SortableHeader label="Attempted" sortKey="attemptedCount" currentSort={scenarioSort} onSort={onSort} align="center" />
  //                         <SortableHeader label="Passed" sortKey="passedCount" currentSort={scenarioSort} onSort={onSort} align="center" />
  //                         <SortableHeader label="Failed" sortKey="failedCount" currentSort={scenarioSort} onSort={onSort} align="center" />
  //                         <th className="py-3 px-4"></th>
  //                     </tr>
  //                 </thead>
  //                 <tbody className="divide-y divide-slate-100">
  //                     {scenariosLoading ? (
  //                         Array.from({ length: 5 }).map((_, index) => (
  //                             <tr key={index} className="animate-pulse">
  //                                 <td className="py-3 px-6">
  //                                     <Skeleton className="h-4 w-32" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center">
  //                                     <Skeleton className="h-4 w-8 mx-auto" />
  //                                 </td>
  //                                 <td className="py-3 px-4 text-right">
  //                                     <Skeleton className="h-4 w-4 ml-auto" />
  //                                 </td>
  //                             </tr>
  //                         ))
  //                     ) : sortedScenarios?.length === 0 ? (
  //                         <tr>
  //                             <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
  //                                 No records found
  //                             </td>
  //                         </tr>
  //                     ) : (
  //                         sortedScenarios?.map((scenario) => (
  //                             <tr
  //                                 key={scenario.id}
  //                                 onClick={() => handleScenarioClick(scenario)}
  //                                 className="hover:bg-slate-50/80 cursor-pointer transition-all group"
  //                             >
  //                                 <td className="py-3 px-6">
  //                                     <div className="font-semibold text-slate-700 text-sm group-hover:text-[#2d87a4] transition-colors">{scenario.title}</div>
  //                                 </td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{scenario.assignedCount}</td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-blue-600">{scenario.attemptedCount}</td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-emerald-600">{scenario.passedCount}</td>
  //                                 <td className="py-3 px-4 text-center text-sm font-medium text-red-500">{scenario.failedCount}</td>
  //                                 <td className="py-3 px-4 text-right">
  //                                     <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2d87a4] transition-colors inline-block" />
  //                                 </td>
  //                             </tr>
  //                         ))
  //                     )}
  //                 </tbody>
  //             </table>

  //             {/* Scenario Pagination */}
  //             {scenarioMeta && scenarioMeta.totalPages > 1 && (
  //                 <div className="py-4 border-t border-slate-100 bg-slate-50/30 sticky bottom-0 left-0">
  //                     <Pagination>
  //                         <PaginationContent>
  //                             <PaginationItem>
  //                                 <PaginationPrevious
  //                                     onClick={() => setScenarioPage(p => Math.max(1, p - 1))}
  //                                     disabled={scenarioPage === 1}
  //                                     className={scenarioPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
  //                                 />
  //                             </PaginationItem>

  //                             {Array.from({ length: scenarioMeta.totalPages }, (_, i) => i + 1).map((p) => {
  //                                 if (
  //                                     p === 1 ||
  //                                     p === scenarioMeta.totalPages ||
  //                                     (p >= scenarioPage - 1 && p <= scenarioPage + 1)
  //                                 ) {
  //                                     return (
  //                                         <PaginationItem key={p}>
  //                                             <PaginationLink
  //                                                 isActive={p === scenarioPage}
  //                                                 onClick={() => setScenarioPage(p)}
  //                                                 className="cursor-pointer"
  //                                             >
  //                                                 {p}
  //                                             </PaginationLink>
  //                                         </PaginationItem>
  //                                     );
  //                                 } else if (p === scenarioPage - 2 || p === scenarioPage + 2) {
  //                                     return (
  //                                         <PaginationItem key={p}>
  //                                             <PaginationEllipsis />
  //                                         </PaginationItem>
  //                                     );
  //                                 }
  //                                 return null;
  //                             })}

  //                             <PaginationItem>
  //                                 <PaginationNext
  //                                     onClick={() => setScenarioPage(p => Math.min(scenarioMeta.totalPages, p + 1))}
  //                                     disabled={scenarioPage === scenarioMeta.totalPages}
  //                                     className={scenarioPage === scenarioMeta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
  //                                 />
  //                             </PaginationItem>
  //                         </PaginationContent>
  //                     </Pagination>
  //                 </div>
  //             )}
  //         </div>
  //     );
  // };
  //#endregion

  //#region
  /*
    const renderCityTable = () => {
        const onSort = (key: string) => {
            setCitySort(prev => ({
                key,
                order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
            }));
        };

        return (
            <div className="bg-white rounded-xl shadow-none border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <SortableHeader label="City Name" sortKey="name" currentSort={citySort} onSort={onSort} />
                            <SortableHeader label="Total Staff" sortKey="staffCount" currentSort={citySort} onSort={onSort} align="center" />
                            <SortableHeader label="Assigned" sortKey="assigned" currentSort={citySort} onSort={onSort} align="center" />
                            <SortableHeader label="Attempted" sortKey="attempted" currentSort={citySort} onSort={onSort} align="center" />
                            <SortableHeader label="Passed" sortKey="passed" currentSort={citySort} onSort={onSort} align="center" />
                            <SortableHeader label="Failed" sortKey="failed" currentSort={citySort} onSort={onSort} align="center" />
                            <th className="py-3 px-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {citiesLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    <td className="py-3 px-6">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Skeleton className="h-4 w-4 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : sortedCities?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            sortedCities?.map((city) => (
                                <tr
                                    key={city.id}
                                    onClick={() => handleCityClick(city)}
                                    className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                                >
                                    <td className="py-3 px-6">
                                        <div className="font-semibold text-slate-700 text-sm group-hover:text-[#2d87a4] transition-colors">{city.name}</div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{city.staffCount}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{city.assigned}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-blue-600">{city.attempted}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-emerald-600">{city.passed}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-red-500">{city.failed}</td>
                                    <td className="py-3 px-4 text-right">
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2d87a4] transition-colors inline-block" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                // City Pagination
                {cityMeta && cityMeta.totalPages > 1 && (
                    <div className="py-4 border-t border-slate-100 bg-slate-50/30 sticky bottom-0 left-0">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCityPage(p => Math.max(1, p - 1))}
                                        disabled={cityPage === 1}
                                        className={cityPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: cityMeta.totalPages }, (_, i) => i + 1).map((p) => {
                                    if (
                                        p === 1 ||
                                        p === cityMeta.totalPages ||
                                        (p >= cityPage - 1 && p <= cityPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={p === cityPage}
                                                    onClick={() => setCityPage(p)}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (p === cityPage - 2 || p === cityPage + 2) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCityPage(p => Math.min(cityMeta.totalPages, p + 1))}
                                        disabled={cityPage === cityMeta.totalPages}
                                        className={cityPage === cityMeta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        );
    };

    const renderDepartmentTable = () => {
        const onSort = (key: string) => {
            setDeptSort(prev => ({
                key,
                order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
            }));
        };

        return (
            <div className="bg-white rounded-xl shadow-none border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <SortableHeader label="Department Name" sortKey="name" currentSort={deptSort} onSort={onSort} />
                            <SortableHeader label="Total Staff" sortKey="staffCount" currentSort={deptSort} onSort={onSort} align="center" />
                            <SortableHeader label="Assigned" sortKey="assigned" currentSort={deptSort} onSort={onSort} align="center" />
                            <SortableHeader label="Attempted" sortKey="attempted" currentSort={deptSort} onSort={onSort} align="center" />
                            <SortableHeader label="Passed" sortKey="passed" currentSort={deptSort} onSort={onSort} align="center" />
                            <SortableHeader label="Failed" sortKey="failed" currentSort={deptSort} onSort={onSort} align="center" />
                            <th className="py-3 px-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {deptsLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    <td className="py-3 px-6">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Skeleton className="h-4 w-4 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : sortedDepts?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            sortedDepts?.map((dept) => (
                                <tr
                                    key={dept.id}
                                    onClick={() => handleDepartmentClick(dept)}
                                    className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                                >
                                    <td className="py-3 px-6">
                                        <div className="font-semibold text-slate-700 text-sm group-hover:text-[#2d87a4] transition-colors">{dept.name}</div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{dept.staffCount}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{dept.assigned}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-blue-600">{dept.attempted}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-emerald-600">{dept.passed}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-red-500">{dept.failed}</td>
                                    <td className="py-3 px-4 text-right">
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2d87a4] transition-colors inline-block" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                // Dept Pagination
                {deptMeta && deptMeta.totalPages > 1 && (
                    <div className="py-4 border-t border-slate-100 bg-slate-50/30 sticky bottom-0 left-0">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setDeptPage(p => Math.max(1, p - 1))}
                                        disabled={deptPage === 1}
                                        className={deptPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: deptMeta.totalPages }, (_, i) => i + 1).map((p) => {
                                    if (
                                        p === 1 ||
                                        p === deptMeta.totalPages ||
                                        (p >= deptPage - 1 && p <= deptPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={p === deptPage}
                                                    onClick={() => setDeptPage(p)}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (p === deptPage - 2 || p === deptPage + 2) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setDeptPage(p => Math.min(deptMeta.totalPages, p + 1))}
                                        disabled={deptPage === deptMeta.totalPages}
                                        className={deptPage === deptMeta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        );
    };

    const renderUnitTable = () => {
        const onSort = (key: string) => {
            setUnitSort(prev => ({
                key,
                order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
            }));
        };

        return (
            <div className="bg-white rounded-xl shadow-none border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <SortableHeader label="Unit Name" sortKey="name" currentSort={unitSort} onSort={onSort} />
                            <SortableHeader label="Total Staff" sortKey="staffCount" currentSort={unitSort} onSort={onSort} align="center" />
                            <SortableHeader label="Assigned" sortKey="assigned" currentSort={unitSort} onSort={onSort} align="center" />
                            <SortableHeader label="Attempted" sortKey="attempted" currentSort={unitSort} onSort={onSort} align="center" />
                            <SortableHeader label="Passed" sortKey="passed" currentSort={unitSort} onSort={onSort} align="center" />
                            <SortableHeader label="Failed" sortKey="failed" currentSort={unitSort} onSort={onSort} align="center" />
                            <th className="py-3 px-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {unitsLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    <td className="py-3 px-6">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Skeleton className="h-4 w-8 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Skeleton className="h-4 w-4 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : sortedUnits?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            sortedUnits?.map((unit) => (
                                <tr
                                    key={unit.id}
                                    onClick={() => handleUnitClick(unit)}
                                    className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                                >
                                    <td className="py-3 px-6">
                                        <div className="font-semibold text-slate-700 text-sm group-hover:text-[#2d87a4] transition-colors">{unit.name}</div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{unit.staffCount}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-slate-600">{unit.assigned}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-blue-600">{unit.attempted}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-emerald-600">{unit.passed}</td>
                                    <td className="py-3 px-4 text-center text-sm font-medium text-red-500">{unit.failed}</td>
                                    <td className="py-3 px-4 text-right">
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2d87a4] transition-colors inline-block" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                // Unit Pagination
                {unitMeta && unitMeta.totalPages > 1 && (
                    <div className="py-4 border-t border-slate-100 bg-slate-50/30 sticky bottom-0 left-0">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setUnitPage(p => Math.max(1, p - 1))}
                                        disabled={unitPage === 1}
                                        className={unitPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: unitMeta.totalPages }, (_, i) => i + 1).map((p) => {
                                    if (
                                        p === 1 ||
                                        p === unitMeta.totalPages ||
                                        (p >= unitPage - 1 && p <= unitPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={p === unitPage}
                                                    onClick={() => setUnitPage(p)}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (p === unitPage - 2 || p === unitPage + 2) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setUnitPage(p => Math.min(unitMeta.totalPages, p + 1))}
                                        disabled={unitPage === unitMeta.totalPages}
                                        className={unitPage === unitMeta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        );
    };*/
  //#endregion

  return (
    <AdminLayoutShell>
      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col min-w-0">
        {/* Top Overview Components (Full Width Capable) */}
        <OverviewDashboard handleLogout={handleLogout} />

        <div className="w-full px-4 md:px-8 pb-8">

          {/* Use the new component here */}
          <SessionReportsTable />
        </div>
      </main>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </AdminLayoutShell>
  );
}
