import React from "react";
import { ParameterScore } from "./types";
import { formatParamName, getScoreColor } from "./scoringUtils";

interface ParameterListProps {
  data: Record<string, ParameterScore>;
  totalScore: number;
  compact?: boolean;
  overallScore: number
}

export const ParameterList: React.FC<ParameterListProps> = ({
  data,
  totalScore,
  compact = false,
  overallScore
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? "p-4" : "p-6"}`}
    >
      <div
        className={`flex justify-between items-center ${compact ? "mb-4" : "mb-6"}`}
      >
        <h3 className="text-base font-semibold text-gray-900">
          Parameter Performance
        </h3>
        <span className={`text-lg font-bold ${getScoreColor(totalScore, overallScore)}`}>
          {totalScore}
          <span className="text-gray-400 text-sm font-medium"> / {overallScore}</span>
        </span>
      </div>

      <div className="space-y-6">
        {(Object.entries(data) as [string, ParameterScore][]).map(
          ([key, value]) => {
            const score = isNaN(value.score) ? 0 : value.score;
            let barColor = "bg-red-500";
            let textColor = "text-red-600";

            if (score >= 8) {
              barColor = "bg-emerald-500";
              textColor = "text-emerald-700";
            } else if (score >= 6) {
              barColor = "bg-amber-400";
              textColor = "text-amber-700";
            }

            return (
              <div key={key} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formatParamName(key)}
                  </span>
                  <span className={`text-sm font-bold ${textColor}`}>
                    {value.score}
                    {!isNaN(value.score) && <span className="text-gray-400 text-xs font-medium">
                      {" "}
                      / 10
                    </span>}
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${(score / 10) * 100}%` }}
                  ></div>
                </div>

                <p className="text-gray-500 text-xs leading-relaxed">
                  {value.justification}
                </p>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};
