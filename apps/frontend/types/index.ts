export interface User {
  name: string;
  id: string;
  staff_id?: string;
  role: string;
  department?: string | null;
  unit?: string | null;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: ('Beginner' | 'Intermediate' | 'Advanced')[];
  type: 'Medical' | 'Communication' | 'Procedural';
  is_active?: boolean;
  departments?: string[];
  roleplay_prompt?: string | null;
  examiner_prompt?: string | null;
  roleplay_eval_prompt?: string | null;
  examiner_eval_prompt?: string | null;
  // Configs
  intro_config?: AgentConfig | null;
  roleplay_config?: AgentConfig | null;
  examiner_config?: AgentConfig | null;
}

export interface AgentConfig {
  voiceName?: string;
  temperature?: number;
  model?: string;
}

export interface StageData {
  audio: Blob | null;
  transcript: string;
}

export interface AssessmentReport {
  intro: StageData;
  roleplay: StageData;
  test: StageData;
}

export interface ScoreBreakdown {
    parameters: { obtained: number; total: number };
    roleplay: { obtained: number; total: number };
    verbal: { obtained: number; total: number };
}

export interface Attempt {
    id: string;
    date: string;
    status: 'Pass' | 'Fail';
    totalScore: number; // Percentage
    breakdown: ScoreBreakdown;
}

export interface Assignment {
    id: string;
    staffId: string;
    staffName: string;
    scenarioId: string;
    scenarioTitle: string;
    status: 'Pending' | 'Attempted';
    attempts: Attempt[]; // Sorted by date desc
}

export interface AdminStaffStats {
    id: string;
    name: string;
    role: string;
    staffId: string;
    assigned: number;
    attempted: number;
    passed: number;
    failed: number;
}

export interface AdminScenarioStats {
    id: string;
    title: string;
    assignedCount: number;
    attemptedCount: number;
    passedCount: number;
    failedCount: number;
}

export interface AdminCityStats {
    id: string;
    name: string;
    staffCount: number;
    assigned: number;
    attempted: number;
    passed: number;
    failed: number;
}

export interface AdminDepartmentStats {
    id: string;
    name: string;
    staffCount: number;
    assigned: number;
    attempted: number;
    passed: number;
    failed: number;
}

export interface AdminUnitStats {
    id: string;
    name: string;
    staffCount: number;
    assigned: number;
    attempted: number;
    passed: number;
    failed: number;
}