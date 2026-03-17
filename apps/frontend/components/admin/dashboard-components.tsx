import React from 'react';
import { Info, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export const HeaderWithInfo = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <div className="flex items-center gap-1.5 group cursor-help">
        {label}
        <Info size={12} className="text-slate-300 group-hover:text-[#2d87a4] transition-colors" />
    </div>
);

export const StatCard = ({ title, value, icon, isLoading, color }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean, color: 'blue' | 'emerald' | 'amber' | 'indigo' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="bg-white p-3 md:p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 transition-all hover:border-slate-300 shadow-none">
            <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-[12px] font-semibold text-slate-400 uppercase md:tracking-wider">{title}</span>
                <div className={`p-1 md:p-2 rounded-xl border ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className="text-xl md:text-2xl font-semibold md:font-black text-slate-800 tracking-tight">{value}</div>
                )}
            </div>
        </div>
    );
};

export const SortableHeader = ({ label, sortKey, currentSort, onSort, align = 'left' }: { label: string, sortKey: string, currentSort: { key: string, order: 'asc' | 'desc' }, onSort: (key: string) => void, align?: 'left' | 'center' | 'right' }) => {
    const isActive = currentSort.key === sortKey;
    const justifyClass = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';
    return (
        <th
            className={`py-3 px-4 cursor-pointer group hover:bg-slate-50 transition-colors whitespace-nowrap ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
            onClick={() => onSort(sortKey)}
        >
            <div className={`flex items-center gap-1.5 ${justifyClass}`}>
                <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-[#2d87a4]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {label}
                </span>
                {isActive ? (
                    currentSort.order === 'asc' ? <ArrowUp size={12} className="text-[#2d87a4]" /> : <ArrowDown size={12} className="text-[#2d87a4]" />
                ) : (
                    <ArrowUpDown size={12} className="text-slate-300 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                )}
            </div>
        </th>
    );
};
