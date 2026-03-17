"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Split,
  Timer,
  RefreshCcw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import {
  getSessionWithScenario,
  getStageResults,
  getEvaluationResults,
} from "@/lib/actions";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { KeyInsights } from "@/components/report/KeyInsights";
import { ParameterList } from "@/components/report/ParameterList";
import { ScoreCard } from "@/components/report/ScoreCard";
import { SopChecklist } from "@/components/report/SopChecklist";
import {
  calculateScores,
  getScoreColor,
} from "@/components/report/scoringUtils";
import {
  ExaminerEvaluation,
  ParameterScore,
  ReportData,
  RoleplayEvaluation,
  SopAdherence,
  StepChecklist,
} from "@/components/report/types";
import { useAuth } from "@/context/auth-context";

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
};

const toChecklist = (value: unknown): StepChecklist[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => isObject(item))
    .map((item) => ({
      step: String(item.step ?? ""),
      status: String(item.status ?? ""),
      notes: item.notes ? String(item.notes) : undefined,
    }));
};

const normalizeSopAdherence = (value: unknown): SopAdherence => {
  const source = isObject(value) ? value : {};
  return {
    tag: String(source.tag ?? "Very Weak"),
    justification: String(source.justification ?? ""),
    score_out_of_30:
      source.score_out_of_30 !== undefined && source.score_out_of_30 !== null
        ? Number(source.score_out_of_30)
        : null,
    comprehensive_evaluation: source.comprehensive_evaluation
      ? String(source.comprehensive_evaluation)
      : undefined,
    step_checklist: toChecklist(source.step_checklist),
    violations_or_do_not_behaviours: toStringArray(
      source.violations_or_do_not_behaviours,
    ),
    do_not_remembering: toChecklist(source.do_not_remembering),
  };
};

const normalizeParameterScores = (
  value: unknown,
): Record<string, ParameterScore> => {
  if (!isObject(value)) return {};
  const output: Record<string, ParameterScore> = {};

  Object.entries(value).forEach(([key, raw]) => {
    if (!isObject(raw)) return;
    output[key] = {
      score: isNaN(raw.score) ? raw.score : (Number(raw.score) || 0),
      justification: String(raw.justification ?? ""),
    };
  });

  return output;
};

const normalizeRoleplayEvaluation = (value: unknown): RoleplayEvaluation => {
  const source = isObject(value) ? value : {};
  return {
    summary: toStringArray(source.summary),
    parameter_scores: normalizeParameterScores(source.parameter_scores),
    sop_adherence: normalizeSopAdherence(source.sop_adherence),
    overall_remarks: toStringArray(source.overall_remarks),
  };
};

const normalizeExaminerEvaluation = (value: unknown): ExaminerEvaluation => {
  const source = isObject(value) ? value : {};
  return {
    sop_steps_remembering: normalizeSopAdherence(source.sop_steps_remembering),
  };
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds || Number.isNaN(seconds)) return "0 Mins";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} Mins${secs > 0 ? ` ${secs} secs` : ""}`;
};

export default function AssessmentReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPendingGeneration, setIsPendingGeneration] = useState(false);
  const [pendingStages, setPendingStages] = useState<
    Array<"roleplay" | "test">
  >([]);
  const [assessmentScores, setAssessmentScores] = useState<Record<string, any>>()

  const [isDemo, setIsDemo] = useState(true);

  const [countdown, setCountdown] = useState(60);
  const countdownRef = useRef(60);

  // Check for PDF mode query param
  const [isPdfMode, setIsPdfMode] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      setIsPdfMode(p.get("pdf") === "1");
    }
  }, []);

  const fetchReport = async (isPolling = false) => {
    if (!isPolling) {
      setIsLoading(true);
      setError(null);
      setIsPendingGeneration(false);
      setPendingStages([]);
    }

    try {
      // 1. Fetch Session
      const sessionResult = await getSessionWithScenario(sessionId);
      if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || "Session data not found");
      }
      const sessionData = sessionResult.data;
      setAssessmentScores(sessionData.assessmentScores as any)

      // 2. Fetch Evaluation Results
      const evalResult = await getEvaluationResults(sessionId);
      if (!evalResult.success || !evalResult.data) {
        throw new Error(
          evalResult.error || "Failed to fetch evaluation results",
        );
      }
      const evalData = evalResult.data;

      // 3. Fetch Stage Results (for audio URL etc)
      const stageResult = await getStageResults(sessionId);
      if (!stageResult.success || !stageResult.data) {
        throw new Error(stageResult.error || "Failed to fetch stage results");
      }
      const stageData = stageResult.data;

      const roleplayResult = evalData.find(
        (item: any) => item.stage === "roleplay",
      );
      const testResult = evalData.find((item: any) => item.stage === "test");

      // Check whether a test stage audio was ever recorded (Demo sessions skip test)
      const testStageRow = stageData.find((item: any) => item.stage === "test");
      const testAudioExists = !!testStageRow?.audio_url;

      if (!roleplayResult || (!testResult && testAudioExists)) {
        // Evals not ready yet — the assessment page already enqueued the job.
        // Just enter the polling state; do NOT re-enqueue here.
        const missingStages: Array<"roleplay" | "test"> = [];
        if (!roleplayResult) missingStages.push("roleplay");
        if (!testResult && testAudioExists) missingStages.push("test");

        setIsPendingGeneration(true);
        setPendingStages(missingStages);
        if (!isPolling) setData(null);
        return;
      }

      const roleplayStage = stageData.find(
        (item: any) => item.stage === "roleplay",
      );
      const testStage = stageData.find((item: any) => item.stage === "test");
      const profile = (sessionData as any).profile || {
        name: "Unknown",
        role: "Staff",
        staff_id: "",
      };
      const scenario = sessionData.scenarios as any;

      const startDate = new Date(sessionData.startedAt);
      const assessmentDate = startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const assessmentTime = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // TODO: Demo sessions have no test stage at all
      const isDemoSession = !testResult && !testAudioExists;
      setIsDemo(true);

      const formattedData: ReportData = {
        roleplayEvaluation: normalizeRoleplayEvaluation(
          roleplayResult.eval_result,
        ),
        examinerEvaluation: testResult
          ? normalizeExaminerEvaluation(testResult.eval_result)
          : undefined,
        staffName: profile.name,
        staffRole: profile.role,
        staffId: profile.staff_id || "N/A",
        scenarioName: scenario?.title || "Assessment Report",
        scenarioDescription: scenario?.description || "",
        metadata: {
          assessmentDate,
          assessmentTime,
          totalDuration: formatDuration(sessionData.totalDurationSeconds),
          roleplayDuration:
            formatDuration(roleplayStage?.duration_seconds) || "3 Mins",
          examinerDuration:
            formatDuration(testStage?.duration_seconds) || "2 Mins",
        },
      };

      setIsPendingGeneration(false);
      setPendingStages([]);
      setData(formattedData);
    } catch (err: any) {
      console.error(err);
      if (!isPolling) setError(err?.message || "Failed to load report");
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Polling for pending generation
  useEffect(() => {
    if (!isPendingGeneration) return;

    countdownRef.current = 60;
    setCountdown(60);

    const interval = setInterval(() => {
      countdownRef.current -= 1;

      if (countdownRef.current <= 0) {
        countdownRef.current = 60;
      }

      setCountdown(countdownRef.current);

      if (
        countdownRef.current === 40 ||
        countdownRef.current === 20 ||
        countdownRef.current === 60
      ) {
        fetchReport(true);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingGeneration, sessionId]);

  const scores = useMemo(() => {
    if (!data) return null;
    return calculateScores(data);
  }, [data]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  if (isExportingPdf) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#2d87a4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Generating PDF...</p>
        </div>
      </div>
    );
  }

  if (isPendingGeneration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-sky-50 border-4 border-[#2d87a4]/20 flex items-center justify-center relative">
              <svg
                className="absolute w-full h-full -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-[#2d87a4] transition-all duration-1000 ease-linear"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(countdown / 60) * 100}, 100`}
                />
              </svg>
              <span className="text-xl font-bold text-[#2d87a4]">
                {countdown}s
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Report Is Being Generated
          </h1>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            The evaluation will be ready in {countdown} secs.
          </p>
          {pendingStages.length > 0 && (
            <p className="text-xs text-gray-500 mb-6 font-medium bg-gray-50 py-2 rounded-lg border border-gray-100 inline-block px-4">
              Currently generating:{" "}
              <span className="uppercase">{pendingStages.join(", ")}</span>
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            {/* <button
              onClick={() => fetchReport(false)}
              className="px-6 py-2.5 bg-[#2d87a4] hover:bg-[#236c84] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-[#2d87a4]/20 transition-colors"
            >
              <RefreshCcw size={16} />
              Manual Refresh
            </button> */}
            <button
              onClick={handleBack}
              className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !scores) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-3">
            Unable to Load Report
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {error || "Unknown error while loading the report."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchReport(false)}
              className="px-4 py-2 bg-[#2d87a4] hover:bg-[#236c84] text-white rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    roleplayEvaluation,
    examinerEvaluation,
    staffName,
    staffRole,
    staffId,
    metadata,
    scenarioName,
    scenarioDescription,
  } = data;
  const roleplayTotalScore = scores.paramScoreSum + scores.roleplayScore;

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      // construct the URL ensuring no existing pdf param
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("pdf");

      const source = encodeURIComponent(currentUrl.toString());
      
      // MOCK PDF DOWNLOAD: Prevent real API call to /api/export-pdf
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const blob = new Blob(["Mock PDF Content generated during simulated offline run"], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${scenarioName}-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-gray-900 print:bg-white print:p-0">
      {!isPdfMode && (
        <div className="max-w-6xl mx-auto mb-4 flex justify-between items-center print:hidden">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-800"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                aria-label="Download PDF report"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Download Report</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div
        data-pdf-ready="true"
        className="max-w-6xl mx-auto space-y-10 print:max-w-none print:space-y-6"
      >
        <div
          data-pdf-block="true"
          className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start print:shadow-none print:border print:p-6"
        >
          <div className="flex-1 space-y-5 w-full">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100 print:border-blue-200">
                SOP Evaluation Report
              </span>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {scenarioName}
              </h1>
              <p className="text-gray-500 text-lg mt-3 leading-relaxed max-w-3xl">
                {scenarioDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-2">
              <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 print:bg-transparent print:border-gray-200">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span className="font-medium">{metadata.assessmentDate}</span>
              </div>
              <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 print:bg-transparent print:border-gray-200">
                <Clock size={16} className="mr-2 text-gray-400" />
                <span className="font-medium">{metadata.assessmentTime}</span>
              </div>
              <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 print:bg-transparent print:border-blue-200">
                <Timer size={16} className="mr-2 text-blue-400" />
                <span className="font-semibold">
                  Duration: {metadata.totalDuration}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-0 flex items-center md:pl-10 md:border-l border-gray-100 self-stretch print:mt-4 print:pl-0 print:border-l-0">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Staff Name:
              </span>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 leading-tight">
                  {staffName}
                </div>
                <div className="flex flex-col items-end mt-2 gap-1">
                  <span className="text-xs text-gray-400 font-medium tracking-wide">
                    ID: {staffId}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 print:bg-transparent print:border-gray-200">
                    {staffRole}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-pdf-block="true" className="print:break-inside-avoid">
          <ScoreCard
            isDemo={true}
            totalScore={assessmentScores?.score_breakdown?.total_percentage}
            isPass={scores.isPass}
            paramScore={assessmentScores?.score_breakdown?.total_percentage}
            roleplayScore={scores.roleplayScore}
            examinerScore={scores.examinerScore}
            obtainedPercentage={assessmentScores?.score_breakdown?.total_percentage}
            obtainedScore={assessmentScores?.score_breakdown?.obtained_score}
            overallScore={assessmentScores?.score_breakdown?.overall_parameters_points}
            ragStatus={assessmentScores?.rag_status}
          />
        </div>

        {/* {(nonverbal?.roleplay || nonverbal?.test) && (
        <div data-pdf-block="true"
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm print:shadow-none print:p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                Nonverbal Video Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["roleplay", "test"] as const).map((stage) => {
                const stageData = nonverbal?.[stage];
                if (!stageData) return null;
                return (
                <div key={stage} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        {stage === "roleplay" ? "Roleplay" : "Verbal Test"}
                    </p>
                    <div className="text-sm text-gray-700 space-y-1">
                        <p>Eye Contact: {toPercent(stageData.eyeContactRatio)}</p>
                        <p>Posture: {toPercent(stageData.postureScore)}</p>
                        <p>Face Visibility: {toPercent(stageData.faceVisibilityRatio)}</p>
                        <p>Stability: {toPercent(1 - stageData.instabilityRatio)}</p>
                        <p>
                            Dominant Expression:{" "}
                            <span className="font-medium capitalize">
                                {stageData.dominantExpression}
                            </span>
                        </p>
                    </div>
                    {stageData.coachingNotes.length > 0 && (
                    <ul className="mt-3 text-xs text-gray-600 space-y-1 list-disc pl-4">
                        {stageData.coachingNotes.slice(0, 2).map((note, index) => (
                        <li key={index}>{note}</li>
                        ))}
                    </ul>
                    )}
                </div>
                );
                })}
            </div>
        </div>
        )} */}

        {isPdfMode && (
          <>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Grooming
                </p>
                <div className="h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                  Score / 10
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Body Language
                </p>
                <div className="h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                  Score / 10
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Trainer Name/Sign
                </p>
                <div className="h-12 rounded-lg border border-dashed border-gray-300"></div>
              </div>
            </div>
            <div className="pt-6 text-center text-gray-500 text-sm tracking-wide">
              View Assement Details on the Following Page
            </div>
          </>
        )}

        <div
          className="pt-8 border-t border-gray-200 print:break-before-page"
          style={{ pageBreakBefore: isPdfMode ? "always" : "auto" }}
          data-roleplay-section="true"
          data-pdf-page-break-before={isPdfMode ? "true" : undefined}
        >
          <div
            data-pdf-block="true"
            className={`flex items-center justify-between border-b border-gray-200 print:mb-4
                ${isPdfMode ? "mb-4 pb-1" : "mb-6 pb-2"}`}
          >
            <div className="flex items-baseline space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Roleplay Performance
              </h2>
              <div className="flex items-center text-sm font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm print:shadow-none">
                <Timer size={14} className="mr-1.5" />
                {metadata.roleplayDuration}
              </div>
            </div>
            {/* <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Section Score
              </p>
              <div className="flex items-baseline justify-end">
                <span
                  className={`text-2xl font-bold ${getScoreColor(roleplayTotalScore, assessmentScores?.score_breakdown?.overall_parameters_points)}`}
                >
                  {roleplayTotalScore}
                </span>
                <span className="text-gray-900 font-medium ml-1 text-base">
                  {" "}
                  / {assessmentScores?.score_breakdown?.overall_parameters_points}
                </span>
              </div>
            </div> */}
          </div>

          <div
            data-pdf-block="true"
            className={`bg-white border-l-4 border-blue-500 rounded-r-xl shadow-sm
                print:shadow-none print:border print:mb-6 ${isPdfMode ? "p-5 mb-5" : "p-8 mb-8"}`}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center">
              <FileText size={16} className="mr-2" />
              Overall Remarks
            </h3>
            {roleplayEvaluation.overall_remarks.length > 0 ? (
              roleplayEvaluation.overall_remarks.map((remark, index) => (
                <p
                  key={index}
                  className="text-gray-800 text-lg leading-relaxed"
                >
                  {remark}
                </p>
              ))
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed">
                No overall remarks available for this assessment.
              </p>
            )}
          </div>

          <div
            className={`grid grid-cols-1 lg:grid-cols-12 ${isPdfMode ? "gap-5 mb-4" : "gap-8 mb-10"}`}
          >
            <div className="lg:col-span-7">
              <div
                data-pdf-block="true"
                className="print:break-inside-avoid h-full"
              >
                <ParameterList
                  data={roleplayEvaluation.parameter_scores}
                  totalScore={assessmentScores?.score_breakdown?.obtained_score}
                  compact={isPdfMode}
                  overallScore={assessmentScores?.score_breakdown?.overall_parameters_points}
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div
                data-pdf-block="true"
                className="print:break-inside-avoid h-full"
              >
                <KeyInsights
                  summary={roleplayEvaluation.summary}
                  violations={
                    roleplayEvaluation.sop_adherence
                      .violations_or_do_not_behaviours
                  }
                  compact={isPdfMode}
                />
              </div>
            </div>
          </div>
        </div>

        {true && (
          <div
            className="pt-8 border-t border-gray-200 print:break-before-page"
            style={{ pageBreakBefore: isPdfMode ? "always" : "auto" }}
            data-pdf-page-break-before={isPdfMode ? "true" : undefined}
          >
            <div
              data-pdf-block="true"
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Split size={24} className="mr-3 text-gray-400" />
                SOP Adherence Analysis
              </h2>
            </div>

            <div
              className={`grid grid-cols-1 ${isDemo ? "" : "md:grid-cols-2"} gap-8`}
            >
              <div
                data-pdf-block="true"
                className="flex flex-col h-full print:break-inside-avoid"
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-bold text-gray-900 mr-3">
                      Roleplay Adherence
                    </h3>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      Execution
                    </span>
                  </div>
                </div>
                <SopChecklist
                  title="Steps Followed in Roleplay"
                  tag={roleplayEvaluation.sop_adherence.tag}
                  items={roleplayEvaluation.sop_adherence.step_checklist}
                  violations={
                    roleplayEvaluation.sop_adherence
                      .violations_or_do_not_behaviours
                  }
                  score={scores.roleplayScore}
                  maxScore={15}
                  scoreOutOf30={
                    roleplayEvaluation.sop_adherence.score_out_of_30
                  }
                  comprehensiveEvaluation={
                    roleplayEvaluation.sop_adherence.comprehensive_evaluation
                  }
                />
              </div>

              {!isDemo && examinerEvaluation && (
                <div
                  data-pdf-block="true"
                  className="flex flex-col h-full print:break-inside-avoid"
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-gray-900 mr-3">
                        Examiner Check
                      </h3>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        Knowledge
                      </span>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                      <Timer size={12} className="mr-1" />
                      {metadata.examinerDuration}
                    </div>
                  </div>
                  <SopChecklist
                    title="Verbal SOP Recall"
                    tag={examinerEvaluation.sop_steps_remembering.tag}
                    items={
                      examinerEvaluation.sop_steps_remembering.step_checklist
                    }
                    violations={
                      examinerEvaluation.sop_steps_remembering
                        .violations_or_do_not_behaviours
                    }
                    score={scores.examinerScore}
                    maxScore={15}
                    scoreOutOf30={
                      examinerEvaluation.sop_steps_remembering.score_out_of_30
                    }
                    comprehensiveEvaluation={
                      examinerEvaluation.sop_steps_remembering
                        .comprehensive_evaluation
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
