import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { getScoreColor } from "./scoringUtils";

interface ScoreCardProps {
  isDemo: boolean;
  totalScore: number;
  isPass: boolean;
  paramScore: number;
  roleplayScore: number;
  examinerScore: number;

  overallScore: number;
  obtainedScore: number;
  obtainedPercentage: number
  ragStatus: string
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  isDemo,
  totalScore,
  isPass,
  paramScore,
  roleplayScore,
  examinerScore,
  obtainedPercentage,
  overallScore,
  obtainedScore,
  ragStatus
}) => {
  const maxScore = isDemo ? 85 : 100;
  const totalColorClass = getScoreColor(totalScore, maxScore);

  const getRAGColor = (ragStatus: string) => {
    switch (ragStatus) {
      case "green":
        return "bg-green-50"
      case "amber":
        return "bg-yellow-50"
      case "red":
        return "bg-red-50"
    }
  }

  const getRAGColorBorder = (ragStatus: string) => {
    switch (ragStatus) {
      case "green":
        return "border-green-200"
      case "amber":
        return "border-yellow-200"
      case "red":
        return "border-red-200"
    }
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        className={`rounded-xl shadow-sm border p-6 flex items-center justify-between ${getRAGColor(ragStatus)} ${getRAGColorBorder(ragStatus)}`}
      >
        <div>
          <h3
            className={`text-xs font-semibold uppercase tracking-wider mb-1 ${getRAGColor(ragStatus)}`}
          >
            Final RAG Status
          </h3>
          <span
            className={`text-3xl capitalize font-bold tracking-tight`}
          >
            {ragStatus}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Total Percentage
        </h3>
        <div className="flex items-baseline">
          <span
            className={`text-5xl font-bold tracking-tight ${totalColorClass}`}
          >
            {obtainedPercentage}%
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Score Breakdown
        </h3>
        <div className="flex justify-between items-center space-x-2 text-sm">
          <div className="flex flex-col">
            <span
              className={`font-bold text-xl ${getScoreColor(obtainedScore, overallScore)}`}
            >
              {obtainedScore}
              <span className="text-gray-300 text-base font-normal"> / {overallScore}</span>
            </span>
            <span className="text-gray-500 text-xs">Parameters</span>
          </div>
          <div className="w-px h-8 bg-gray-100"></div>
          {/* <div className="flex flex-col">
            <span
              className={`font-bold text-xl ${getScoreColor(roleplayScore, 15)}`}
            >
              {roleplayScore}
              <span className="text-gray-300 text-base font-normal"> / 15</span>
            </span>
            <span className="text-gray-500 text-xs">Roleplay SOP</span>
          </div> */}
          {!isDemo && (
            <>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="flex flex-col">
                <span
                  className={`font-bold text-xl ${getScoreColor(examinerScore, 15)}`}
                >
                  {examinerScore}
                  <span className="text-gray-300 text-base font-normal">
                    {" "}
                    / 15
                  </span>
                </span>
                <span className="text-gray-500 text-xs">Verbal SOP</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
