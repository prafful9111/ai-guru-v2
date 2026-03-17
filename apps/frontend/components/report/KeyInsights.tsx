import React from "react";
import { Lightbulb, XCircle } from "lucide-react";

interface KeyInsightsProps {
  summary: string[];
  violations?: string[];
  compact?: boolean;
}

export const KeyInsights: React.FC<KeyInsightsProps> = ({
  summary,
  violations,
  compact = false,
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? "p-3" : "p-6"}`}
    >
      <div
        className={`flex justify-between items-center ${compact ? "mb-3" : "mb-4"}`}
      >
        <h3 className="flex gap-2 items-center text-base font-semibold text-gray-900">
          <Lightbulb size={18} className="text-amber-500" />
          Key Insights
        </h3>
      </div>

      <div className="p-6 pt-0 space-y-6 flex-1">
        {violations && violations.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <h4 className="flex items-center text-xs font-bold text-red-700 uppercase tracking-wider mb-4">
              <XCircle size={16} className="mr-2" />
              Critical Violations
            </h4>
            <ul className="space-y-3">
              {violations.map((violation, index) => (
                <li
                  key={index}
                  className="text-sm text-red-900 leading-snug flex items-start"
                >
                  <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                  {violation}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Behavioral Observations
          </h4>
          <ul className="space-y-2">
            {summary.map((item, index) => (
              <li key={index} className="flex items-start group">
                <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0 group-hover:bg-blue-500 transition-colors"></span>
                <span className="text-gray-700 text-sm leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
