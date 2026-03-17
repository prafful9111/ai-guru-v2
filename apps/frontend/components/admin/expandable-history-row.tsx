import Link from "next/link";
import { Assignment } from "@/types";
import { ChevronDown, Eye, FileText, Volume2 } from "lucide-react";
import { useState } from "react";

// --- Simple Score Cell ---
export const ScoreCell: React.FC<{ obtained: number; total: number; isBold?: boolean }> = ({ obtained, total, isBold }) => (
  <div className={`text-sm ${isBold ? 'font-bold text-slate-700' : 'font-medium text-slate-600'}`}>
    {obtained} <span className="text-slate-400 font-normal text-xs">/ {total}</span>
  </div>
);

// --- Status Badges ---
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = status === 'Attempted'
    ? 'bg-blue-50 text-blue-600 border-blue-100'
    : 'bg-amber-50 text-amber-600 border-amber-100';

  return (
    <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  );
};

export const ResultBadge: React.FC<{ status: 'Pass' | 'Fail' }> = ({ status }) => {
  const styles = status === 'Pass'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-red-50 text-red-700 border-red-200';

  return (
    (!status ? <span className={`text-sm font-medium text-slate-600`}>
      -
    </span> : <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      {status}
    </span>)
  );
};

// --- Expandable Row for Detail Modal ---
interface ExpandableHistoryRowProps {
  assignment: Assignment;
  mainLabel: string; // Either Scenario Name or Staff Name depending on context
}

export const ExpandableHistoryRow: React.FC<ExpandableHistoryRowProps> = ({ assignment, mainLabel }) => {
  const [expanded, setExpanded] = useState(false);
  const latestAttempt = assignment.attempts[0];
  const hasHistory = assignment.attempts.length > 1;

  // Actions Component
  const Actions = ({ attemptId }: { attemptId: string }) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/report/${attemptId}`}
        className="p-1.5 text-slate-400 hover:text-[#2d87a4] hover:bg-cyan-50 rounded-lg transition-colors"
        title="View Details"
        onClick={(e) => e.stopPropagation()}
      >
        <Eye size={14} />
      </Link>
      <button
        className="p-1.5 text-slate-400 hover:text-[#2d87a4] hover:bg-cyan-50 rounded-lg transition-colors"
        title="Download Report"
        onClick={(e) => e.stopPropagation()}
      >
        <FileText size={14} />
      </button>
      <button
        className="p-1.5 text-slate-400 hover:text-[#2d87a4] hover:bg-cyan-50 rounded-lg transition-colors"
        title="Listen Audio"
        onClick={(e) => e.stopPropagation()}
      >
        <Volume2 size={14} />
      </button>
    </div>
  );

  return (
    <>
      <tr
        onClick={() => hasHistory && setExpanded(!expanded)}
        className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors ${expanded ? 'bg-slate-50/50' : ''} ${hasHistory ? 'cursor-pointer' : ''}`}
      >
        <td className="py-3 px-6 whitespace-nowrap">
          <span className="font-medium text-slate-700 text-sm">{mainLabel}</span>
        </td>
        <td className="py-3 px-4"><StatusBadge status={assignment.status} /></td>

        {assignment.status === 'Attempted' && latestAttempt ? (
          <>
            <td className="py-3 px-4"><ResultBadge status={latestAttempt.status} /></td>
            <td className="py-3 px-4">
              <span className="text-sm font-bold text-slate-700">
                {latestAttempt?.totalScore ?? 0}%
              </span>
            </td>


            {/* Breakdown Columns */}
            <td className="py-3 px-4">
              <ScoreCell obtained={latestAttempt.breakdown.parameters.obtained} total={latestAttempt.breakdown.parameters.total} />
            </td>
            <td className="py-3 px-4">
              <ScoreCell obtained={latestAttempt.breakdown.roleplay.obtained} total={latestAttempt.breakdown.roleplay.total} />
            </td>
            <td className="py-3 px-4">
              <ScoreCell obtained={latestAttempt.breakdown.verbal.obtained} total={latestAttempt.breakdown.verbal.total} />
            </td>

            {/* Attempts with Expand Arrow */}
            <td className="py-3 px-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {assignment.attempts.length}
                </span>
                {hasHistory ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                    className={`p-0.5 text-slate-400 hover:text-[#2d87a4] transition-all transform ${expanded ? 'rotate-180' : ''}`}
                  >
                    <ChevronDown size={14} />
                  </button>
                ) : (
                  <div className="w-4"></div>
                )}
              </div>
            </td>
            <td className="py-3 px-4"><Actions attemptId={latestAttempt.id} /></td>
          </>
        ) : (
          <td colSpan={7} className="py-3 px-4 text-center text-slate-400 text-xs italic bg-slate-50/30">
            No assessment data available
          </td>
        )}
      </tr>{expanded && assignment.attempts.slice(1).map((attempt) => (
        <tr key={attempt.id} className="bg-slate-50/50 border-b border-slate-100 animate-in fade-in duration-200"><td className="py-3 px-6 pl-10">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <span>{attempt.date}</span>
          </div>
        </td>
          <td className="py-3 px-4"></td>
          <td className="py-3 px-4"><ResultBadge status={attempt.status} /></td>
          <td className="py-3 px-4">
            <span className="text-sm font-semibold text-slate-600">{attempt.totalScore || 0}%</span>
          </td>
          <td className="py-3 px-4">
            <ScoreCell obtained={attempt.breakdown.parameters.obtained} total={attempt.breakdown.parameters.total} />
          </td>
          <td className="py-3 px-4">
            <ScoreCell obtained={attempt.breakdown.roleplay.obtained} total={attempt.breakdown.roleplay.total} />
          </td>
          <td className="py-3 px-4">
            <ScoreCell obtained={attempt.breakdown.verbal.obtained} total={attempt.breakdown.verbal.total} />
          </td>
          <td className="py-3 px-4 text-center text-xs text-slate-400 italic">Previous</td>
          <td className="py-3 px-4"><Actions attemptId={attempt.id} /></td>
        </tr>
      ))}
    </>
  );
};