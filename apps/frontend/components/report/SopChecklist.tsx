import React from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { getScoreColor, getTagColor } from "./scoringUtils";
import { StepChecklist } from "./types";

interface SopChecklistProps {
  title: string;
  items: StepChecklist[];
  violations?: string[];
  tag?: string;
  score?: number;
  maxScore?: number;
  /** Raw LLM score out of 30 (new prompt format) */
  scoreOutOf30?: number | null;
  /** Comprehensive paragraph evaluation (new prompt format, replaces step_checklist) */
  comprehensiveEvaluation?: string;
}

const getIcon = (status: string) => {
  const value = status.toLowerCase();
  if (value === "completed" || value === "remembered") {
    return <CheckCircle2 size={16} className="text-emerald-500" />;
  }
  if (value === "missed") {
    return <XCircle size={16} className="text-red-500" />;
  }
  return <AlertCircle size={16} className="text-amber-500" />;
};

export const SopChecklist: React.FC<SopChecklistProps> = ({
  title,
  items,
  violations,
  tag,
  score,
  maxScore,
  scoreOutOf30,
  comprehensiveEvaluation,
}) => {
  const tagColorClass = tag ? getTagColor(tag) : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        {/* <div> */}
        {/* <h3 className="font-semibold text-gray-900 text-sm">{title}</h3> */}
        {/* Tag-based score (out of maxScore) */}
        {/* {score !== undefined && maxScore !== undefined && (
            <span
              className={`text-xs font-bold mt-0.5 block ${getScoreColor(score, maxScore)}`}
            >
              {score}
              <span className="text-gray-400 font-medium">
                {" "}
                / {maxScore} pts
              </span>
            </span>
          )} */}
        {/* </div> */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Tag badge */}
          {tag && (
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${tagColorClass}`}
            >
              {tag}
            </span>
          )}
          {/* Raw score out of 30 */}
          {/* {scoreOutOf30 !== undefined && scoreOutOf30 !== null && (
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              {scoreOutOf30}{" "}
              <span className="text-gray-400 font-normal">/ 30</span>
            </span>
          )} */}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-5">
        {/* Critical Violations */}
        {violations && violations.length > 0 && (
          <div className="border-b border-red-100 pb-4">
            <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-3">
              Critical Violations
            </h4>
            <ul className="space-y-2">
              {violations.map((violation, index) => (
                <li
                  key={index}
                  className="text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-100 flex items-start leading-snug"
                >
                  <XCircle
                    size={14}
                    className="mr-2 mt-0.5 flex-shrink-0 opacity-75"
                  />
                  {violation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comprehensive Evaluation paragraph (new format) */}
        {comprehensiveEvaluation && (
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Evaluation
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {comprehensiveEvaluation}
            </p>
          </div>
        )}

        {/* Step checklist (old format fallback) */}
        {items.length > 0 && (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-0.5 flex-shrink-0">
                  {getIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${item.status === "Missed" ? "text-gray-900 font-medium" : "text-gray-700"}`}
                  >
                    {item.step}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state — no checklist and no comprehensive evaluation */}
        {items.length === 0 && !comprehensiveEvaluation && (
          <p className="text-sm text-gray-400 italic">
            No evaluation details available.
          </p>
        )}
      </div>
    </div>
  );
};
