import { ReportData } from "./types";

const TAG_POINTS: Record<string, number> = {
  "Very Weak": 0,
  Weak: 5,
  Average: 8,
  Good: 12,
  "Very Good": 15,
};

export const getTagColor = (tag: string) => {
  const value = tag.toLowerCase();
  if (value === "good" || value === "very good") {
    return "text-emerald-700 bg-emerald-100 border-emerald-300";
  }
  if (value === "average") {
    return "text-amber-700 bg-amber-100 border-amber-300";
  }
  return "text-red-700 bg-red-100 border-red-300";
};

export const getTotalScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
};

export const getScoreColor = (score: number, max: number) => {
  const percentage = max > 0 ? (score / max) * 100 : 0;
  if (percentage >= 80) return "text-emerald-600";
  if (percentage >= 60) return "text-amber-600";
  return "text-red-600";
};

export const calculateScores = (data: ReportData) => {
  const params = data.roleplayEvaluation.parameter_scores;
  let paramScoreSum = 0;
  Object.values(params).forEach((value) => {
    paramScoreSum += Number(value.score) || 0;
  });

  const roleplayTag = data.roleplayEvaluation.sop_adherence.tag || "";
  const examinerTag = data.examinerEvaluation?.sop_steps_remembering.tag || "";
  const roleplayScore = TAG_POINTS[roleplayTag] || 0;
  const examinerScore = TAG_POINTS[examinerTag] || 0;

  const totalScore = paramScoreSum + roleplayScore + examinerScore;
  const isPass = totalScore >= 60;

  return {
    paramScoreSum,
    roleplayScore,
    examinerScore,
    totalScore,
    isPass,
  };
};

export const formatParamName = (key: string) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
