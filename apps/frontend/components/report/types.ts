export interface ParameterScore {
  score: number;
  justification: string;
}

export interface StepChecklist {
  step: string;
  status: string;
  notes?: string;
}

export interface SopAdherence {
  tag: string;
  justification: string;
  score_out_of_30?: number | null;
  comprehensive_evaluation?: string;
  step_checklist: StepChecklist[];
  violations_or_do_not_behaviours?: string[];
  do_not_remembering?: StepChecklist[];
}

export interface RoleplayEvaluation {
  summary: string[];
  parameter_scores: Record<string, ParameterScore>;
  sop_adherence: SopAdherence;
  overall_remarks: string[];
}

export interface ExaminerEvaluation {
  sop_steps_remembering: SopAdherence;
}

export interface AssessmentMetadata {
  assessmentDate: string;
  assessmentTime: string;
  totalDuration: string;
  roleplayDuration: string;
  examinerDuration: string;
}

export interface ReportData {
  staffName: string;
  staffRole: string;
  staffId: string;
  scenarioName: string;
  scenarioDescription: string;
  metadata: AssessmentMetadata;
  roleplayEvaluation: RoleplayEvaluation;
  examinerEvaluation?: ExaminerEvaluation;
}
