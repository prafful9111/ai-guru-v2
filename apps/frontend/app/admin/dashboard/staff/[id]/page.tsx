"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Info, LogOut } from 'lucide-react';
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpandableHistoryRow } from '@/components/admin/expandable-history-row';
import { useStaff, useStaffAssignments } from '@/lib/hooks/use-dashboard';
import { HeaderWithInfo } from '@/components/admin/dashboard-components';
import { AdminHeader } from '@/components/admin/admin-header';
import { useAuth } from '@/context/auth-context';

export default function StaffDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { signout } = useAuth();

    const { data: staffResponse, isLoading: staffLoading } = useStaff(id);
    const { data: staffAssignments, isLoading: assignmentsLoading } = useStaffAssignments(id);

    const staff = staffResponse?.data;

    const handleBack = () => {
        router.push('/admin/dashboard');
    };

    const handleLogout = () => {
        signout();
    };

    if (staffLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 flex flex-col">
                <AdminHeader handleLogout={handleLogout} />

                <main className="flex-1 max-w-[1920px] mx-auto w-full p-4 md:p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                            <Skeleton className="h-7 w-32 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                            <Skeleton className="h-4 w-48" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-6 w-1/4 whitespace-nowrap">Scenario Name</th>
                                        <th className="py-3 px-4 w-24 whitespace-nowrap">Status</th>
                                        <th className="py-3 px-4 w-24 whitespace-nowrap">Result</th>
                                        <th className="py-3 px-4 w-24 whitespace-nowrap">Total %</th>
                                        <th className="py-3 px-4 text-center whitespace-nowrap">Attempts</th>
                                        <th className="py-3 px-4 text-right w-24 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="py-3 px-6"><Skeleton className="h-4 w-32" /></td>
                                            <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                            <td className="py-3 px-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                                            <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-4 ml-auto" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="min-h-screen bg-[#f8fafc] p-8 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-slate-800">Staff Not Found</h1>
                <button onClick={handleBack} className="mt-4 text-[#2d87a4] font-medium flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 flex flex-col">
            <AdminHeader handleLogout={handleLogout} />

            <main className="flex-1 max-w-[1920px] mx-auto w-full p-4 md:p-8">
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={handleBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{staff.name}</h2>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">ID: {staff.staffId}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-600">{staff.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                        <div className="min-w-[1000px]">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Assigned Scenarios</h3>
                                <div className="flex gap-4 text-xs font-medium">
                                    <span className="text-slate-500">Passed: <span className="text-emerald-600">{staff.passed}</span></span>
                                    <span className="text-slate-500">Failed: <span className="text-red-500">{staff.failed}</span></span>
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-6 w-1/4 whitespace-nowrap">Scenario Name</th>
                                        <th className="py-3 px-4 w-24 whitespace-nowrap">Status</th>
                                        <th className="py-3 px-4 w-24 whitespace-nowrap">Result</th>
                                        <th className="py-3 px-4 w-24 whitespace-nowrap">Total %</th>
                                        <th className="py-3 px-4 whitespace-nowrap"><HeaderWithInfo label="Parameters" tooltip="Core parameters score" /></th>
                                        <th className="py-3 px-4 whitespace-nowrap"><HeaderWithInfo label="Roleplay SOP" tooltip="Roleplay adherence score" /></th>
                                        <th className="py-3 px-4 whitespace-nowrap"><HeaderWithInfo label="Verbal SOP" tooltip="Verbal communication score" /></th>
                                        <th className="py-3 px-4 text-center whitespace-nowrap">Attempts</th>
                                        <th className="py-3 px-4 text-right w-24 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {assignmentsLoading ? (
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
                                    ) : staffAssignments?.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                                                No records found
                                            </td>
                                        </tr>
                                    ) : (
                                        staffAssignments?.map((assignment) => (
                                            <ExpandableHistoryRow
                                                key={assignment.id}
                                                assignment={assignment}
                                                mainLabel={assignment.scenarioTitle}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
