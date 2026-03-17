"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ArrowLeft, Info, Search } from "lucide-react";
import { useStaffAssignments } from "@/lib/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpandableHistoryRow } from "@/components/admin/expandable-history-row";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { OnboardingGuide } from "@/components/onboarding-guide";

export default function Attempts() {
    const { user, loading: authLoading, signout } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const staffAssignments = useStaffAssignments(!user?.id ? null : user?.id);

    // Filter assignments based on search query
    const filteredAssignments = staffAssignments.data?.filter((assignment) =>
        assignment.scenarioTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Verifying session...</p>
                </div>
            </div>
        );
    }

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [authLoading, user, router]);

    if (!user) {
        return null;
    }

    // Helper for Table Headers with Info Icon
    const HeaderWithInfo = ({ label, tooltip }: { label: string, tooltip: string }) => (
        <div className="flex items-center gap-1.5 group cursor-help">
            {label}
            <Info size={12} className="text-slate-300 group-hover:text-[#2d87a4] transition-colors" />
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] font-sans text-slate-900 flex flex-col md:flex-row">
            <Sidebar onLogout={async () => {
                await signout();
                router.push("/auth/login");
            }} />

            <main className="flex-1 p-4 md:p-10 transition-all duration-300 ml-0 md:ml-20">
                <div className="flex flex-col max-w-[1920px] mx-auto gap-4 md:gap-6">
                    {/* Navbar */}
                    <header className="w-full bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30 flex items-center justify-between rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <h1 className="flex gap-2 items-center text-xl font-semibold text-slate-700 uppercase tracking-wide">
                            <Link href={"/"} className="-ml-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                                <ArrowLeft size={20} className="text-slate-400 hover:text-slate-700" />
                            </Link>
                            <span className="truncate text-base md:text-lg">
                                Attempted Scenarios
                            </span>
                        </h1>
                    </header>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Attempted Scenarios</h3>
                            <div className="relative w-full sm:w-64 onboarding-search-attempts">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search scenarios..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d87a4]/20 focus:border-[#2d87a4] w-full transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto select-none">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-6 w-1/4 whitespace-nowrap">Scenario Name</th>
                                        <th className="py-3 px-4 w-32 whitespace-nowrap">Status</th>
                                        <th className="py-3 px-4 w-32 whitespace-nowrap">Result</th>
                                        <th className="py-3 px-4 w-32 whitespace-nowrap">Total %</th>
                                        <th className="py-3 px-4 whitespace-nowrap"><HeaderWithInfo label="Parameters" tooltip="Core parameters score" /></th>
                                        <th className="py-3 px-4 whitespace-nowrap"><HeaderWithInfo label="Roleplay SOP" tooltip="Roleplay adherence score" /></th>
                                        <th className="py-3 px-4 whitespace-nowrap"><HeaderWithInfo label="Verbal SOP" tooltip="Verbal communication score" /></th>
                                        <th className="py-3 px-4 text-center whitespace-nowrap">Attempts</th>
                                        <th className="py-3 px-4 text-right w-24 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {staffAssignments.isLoading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <tr key={index} className="animate-pulse">
                                                <td className="py-3 px-6"><Skeleton className="h-4 w-32" /></td>
                                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="py-3 px-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                                                <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-4 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        filteredAssignments?.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-8 text-center text-slate-500">
                                                    No records found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAssignments?.map((assignment) => (
                                                <ExpandableHistoryRow
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                    mainLabel={assignment.scenarioTitle}
                                                />
                                            ))
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <OnboardingGuide userId={user.id} stepsKey="attempts" />
        </div>
    );
}
