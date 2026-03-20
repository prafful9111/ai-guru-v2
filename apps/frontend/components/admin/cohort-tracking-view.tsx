"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CohortCompletionTracker } from "./cohort-completion-tracker";
import { CompetencyBreakdownChart } from "./competency-breakdown-chart";
import { CommonPitfallsFeed } from "./common-pitfalls-feed";

export function CohortTrackingView() {
  const searchParams = useSearchParams();
  const currentBatch = searchParams.get("batch") || "all-batches";
  const currentStaff = searchParams.get("staff") || "all-staff";
  const currentDept = searchParams.get("dept") || "all-dept";
  const [batchName, setBatchName] = useState("All Training Groups");

  useEffect(() => {
    if (currentBatch === "all-batches") {
      setBatchName("All Training Groups");
      return;
    }
    if (currentBatch === "individual") {
      setBatchName(currentStaff !== "all-staff" ? `Individual User Focus` : "Individual User");
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("mockBatches") || "[]");
      const found = stored.find((b: any) => b.id === currentBatch);
      if (found) {
        setBatchName(found.name);
      } else if (currentBatch.startsWith("BATCH-")) {
        setBatchName(`Group: ${currentBatch.replace("BATCH-", "")}`);
      } else {
         setBatchName(currentBatch);
      }
    } catch(e) {}
  }, [currentBatch]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Info */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-indigo-900">Training Group: {batchName}</h2>
          <p className="text-[13px] text-indigo-700/80">{
            currentStaff !== "all-staff" ? "Filtered by Staff Member" :
            currentBatch === "all-batches" ? "All active users" : "Filtered cohort view"
          }</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white py-1.5 px-3 rounded-lg border border-indigo-100 shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Completion</p>
            <p className="text-[15px] font-black text-indigo-600">{currentBatch === "all-batches" ? "65%" : "82%"}</p>
          </div>
          <div className="bg-white py-1.5 px-3 rounded-lg border border-indigo-100 shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Score</p>
            <p className="text-[15px] font-black text-emerald-600">{(currentBatch === "all-batches" && currentStaff === "all-staff") ? "82.4" : "88.1"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 w-full">
        {/* Main Tracker Table */}
        <div className="w-full">
          <CohortCompletionTracker filterBatch={currentBatch} filterStaff={currentStaff} filterDept={currentDept} />
        </div>

        {/* Bottom Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <CompetencyBreakdownChart filterBatch={currentBatch} />
          <CommonPitfallsFeed filterBatch={currentBatch} />
        </div>
      </div>
    </div>
  );
}
