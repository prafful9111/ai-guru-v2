import React, { useState } from "react";
import {
  Activity,
  MessageCircle,
  FileText,
  ChevronDown,
  PlayCircle,
} from "lucide-react";
import { Scenario } from "../types";

interface ScenarioCardProps {
  scenario: Scenario;
  onStartAssessment?: (scenario: Scenario, level: string) => void;
  isFirst?: boolean;
}

type Mode = "Assessment" | "Coaching";

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onStartAssessment,
  isFirst = false,
}) => {
  const [mode, setMode] = useState<Mode>("Assessment");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const levels = ["Beginner", "Intermediate", "Advanced"];

  // Helper to get icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case "Medical":
        return <Activity size={24} />;
      case "Communication":
        return <MessageCircle size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  // Modernized Color mapping: Softer backgrounds, clear text
  const activeColors: Record<string, string> = {
    Beginner: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
    Intermediate:
      "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    Advanced: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  };

  const handleModeSelect = (newMode: Mode) => {
    if (newMode === "Coaching") return;
    setMode(newMode);
    setIsDropdownOpen(false);
  };

  const handleLevelClick = (level: string) => {
    if (onStartAssessment) {
      onStartAssessment(scenario, level);
    }
  };

  return (
    <div className={`group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-300 transition-all duration-300 flex flex-col h-full relative z-0 hover:z-10 ${isFirst ? "onboarding-scenario-card-first" : ""}`}>
      {/* Card Header: Icon + Mode Selector */}
      <div className="flex justify-between items-start mb-5">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#2d87a4] flex items-center justify-center border border-slate-100 group-hover:bg-[#2d87a4] group-hover:text-white transition-colors duration-300">
          {getIcon(scenario.type)}
        </div>

        {/* Dropdown Pill */}
        <div className={`relative ${isFirst ? "onboarding-mode-selector" : ""}`}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white border border-[#2d87a4] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#2d87a4] hover:bg-[#2d87a4] hover:text-white transition-all"
          >
            <span>{mode}</span>
            <ChevronDown
              size={14}
              className={`text-current transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => handleModeSelect("Assessment")}
                className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${mode === "Assessment" ? "text-[#2d87a4] bg-slate-50/50" : "text-slate-600"}`}
              >
                Assessment
              </button>
              <button
                onClick={() => handleModeSelect("Coaching")}
                disabled
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 bg-slate-50/40 cursor-not-allowed"
              >
                Coaching (Disabled)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight group-hover:text-[#2d87a4] transition-colors">
        {scenario.title}
      </h3>

      <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
        {scenario.description}
      </p>

      {/* Footer Area */}
      <div className="mt-auto h-16 flex flex-col justify-end">
        {mode === "Assessment" ? (
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Select Level to Begin
            </p>
            <div className={`grid grid-cols-3 gap-3 ${isFirst ? "onboarding-difficulty-levels" : ""}`}>
              {levels.map((level) => {
                const isActive = scenario.difficulty.includes(level as any);

                // Styles for Inactive State
                const inactiveClasses =
                  "bg-white text-slate-300 border-slate-100 hover:border-slate-200 hover:text-slate-400";

                // Styles for Active State based on map
                const activeClass = isActive
                  ? `${activeColors[level]} font-semibold shadow-sm`
                  : inactiveClasses;

                return (
                  <button
                    key={level}
                    disabled={!isActive}
                    onClick={() => handleLevelClick(level)}
                    className={`
                                    py-2 rounded-lg text-[11px] border transition-all duration-200 flex justify-center items-center
                                    ${activeClass}
                                    ${!isActive ? "cursor-not-allowed opacity-60" : "transform"}
                                    ${isFirst && level === "Intermediate" ? "onboarding-intermediate-button" : ""}
                                `}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button className="w-full py-3 bg-[#2d87a4] hover:bg-[#236c84] text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-900/10 hover:shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 group/btn">
            <PlayCircle
              size={18}
              className="text-cyan-100 group-hover/btn:text-white"
            />
            <span>Start Coaching</span>
          </button>
        )}
      </div>
    </div>
  );
};
