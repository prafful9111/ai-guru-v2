import { apiClient } from "@/lib/api-client";

export interface Employee {
  id: string;
  staffId: string;
  name: string;
  role: string;
  assigned: number;
  attempted: number;
  passed: number;
  failed: number;
}

export interface Scenario {
  id: string;
  title: string;
  assignedCount: number;
  attemptedCount: number;
  passedCount: number;
  failedCount: number;
}

export interface Attempt {
  id: string;
  date: string;
  status: "Pass" | "Fail";
  totalScore: number;
  breakdown: {
    parameters: { obtained: number; total: number };
    roleplay: { obtained: number; total: number };
    verbal: { obtained: number; total: number };
  };
}

export interface StaffAssignment {
  id: string;
  staffId: string;
  staffName: string;
  scenarioId: string;
  scenarioTitle: string;
  status: "Pending" | "Attempted";
  attempts: Attempt[];
}

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
  examinerEvaluation: ExaminerEvaluation;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SessionReportStats {
  total: number;
  green: number;
  amber: number;
  red: number;
}

export interface SessionReportsResponse {
  data: SessionReport[];
  meta: PaginationMeta;
  stats: SessionReportStats;
}

export interface DashboardStats {
  totalUsers: number;
  totalAssessments: number;
  uniqueUsers: number;
  passFail: {
    pass: number;
    fail: number;
  };
}

export interface SessionReport {
  sessionId: string;
  dateTime: string;
  completedAt: string | null;
  difficulty: string;
  language: string;
  status: string;
  totalDurationSeconds: number | null;
  // User info
  userId: string;
  staffId: string | null;
  userName: string;
  userDepartment: string | null;
  userUnit: string | null;
  // Scenario info
  scenarioId: string;
  scenarioTitle: string;
  // Evaluation info
  finalScore: number;
  parameterScore: number;
  sopScore: number;
  ragStatus: "RED" | "AMBER" | "GREEN";
  // Actions
  audioUrl: string | null;
  hasVideo: boolean;
}

/* export interface City {
    id: string;
    name: string;
    staffCount: number;
    assigned: number;
    attempted: number;
    passed: number;
    failed: number;
}

export interface Department {
    id: string;
    name: string;
    staffCount: number;
    assigned: number;
    attempted: number;
    passed: number;
    failed: number;
}

export interface Unit {
    id: string;
    name: string;
    staffCount: number;
    assigned: number;
    attempted: number;
    passed: number;
    failed: number;
} */

export const dashboardService = {
  // Staff related endpoints
  getStaffRecords: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    department?: string;
    unit?: string;
  }) =>
    apiClient.get<PaginatedResponse<Employee>>("/api/dashboard/staff", {
      params,
    }),

  getStaffAssignments: (employeeId: string) =>
    apiClient.get<StaffAssignment[]>("/api/dashboard/staff/assignments", {
      params: { employee_id: employeeId },
    }),

  getStaffRecord: (id: string) =>
    apiClient.get<{ data: Employee }>("/api/dashboard/staff", {
      params: { id },
    }),

  // Scenario related endpoints
  getScenarioRecords: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) =>
    apiClient.get<PaginatedResponse<Scenario>>("/api/dashboard/scenarios", {
      params,
    }),

  getScenarioAssignments: (
    scenarioId: string,
    params?: { page?: number; limit?: number },
  ) =>
    apiClient.get<PaginatedResponse<StaffAssignment>>(
      "/api/dashboard/scenarios/assignments",
      {
        params: { scenario_id: scenarioId, ...params },
      },
    ),

  getScenarioRecord: (id: string) =>
    apiClient.get<{ data: Scenario }>("/api/dashboard/scenarios", {
      params: { id },
    }),

  /* // City related endpoints
    getCityRecords: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<City>>('/api/dashboard/cities', { params }),

    getCityAssignments: (cityId: string, params?: { page?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<StaffAssignment>>('/api/dashboard/cities/assignments', {
            params: { city_id: cityId, ...params }
        }),

    getCityRecord: (id: string) =>
        apiClient.get<{ data: City }>('/api/dashboard/cities', { params: { id } }),

    // Department related endpoints
    getDepartmentRecords: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<Department>>('/api/dashboard/departments', { params }),

    getDepartmentAssignments: (deptId: string, params?: { page?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<StaffAssignment>>('/api/dashboard/departments/assignments', {
            params: { dept_id: deptId, ...params }
        }),

    getDepartmentRecord: (id: string) =>
        apiClient.get<{ data: Department }>('/api/dashboard/departments', { params: { id } }),

    // Unit related endpoints
    getUnitRecords: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<Unit>>('/api/dashboard/units', { params }),

    getUnitAssignments: (unitId: string, params?: { page?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<StaffAssignment>>('/api/dashboard/units/assignments', {
            params: { unit_id: unitId, ...params }
        }),

    getUnitRecord: (id: string) =>
        apiClient.get<{ data: Unit }>('/api/dashboard/units', { params: { id } }), */

  getAttemptDetails: (attemptId: string) =>
    apiClient.get<ReportData>(`/api/scenarios/attempts/${attemptId}`),

  getDashboardStats: () =>
    apiClient.get<DashboardStats>("/api/dashboard/stats"),

  getFilters: () => apiClient.get<any[]>("/api/dashboard/filters"),

  // Scenarios list for filter dropdown
  getScenariosList: () =>
    apiClient.get<{ id: string; name: string }[]>(
      "/api/dashboard/scenarios-list",
    ),

  // Session reports endpoints
  getSessionReports: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    unit?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    ragStatus?: string;
    scenarioId?: string;
    difficulty?: string;
  }) =>
    apiClient.get<SessionReportsResponse>("/api/dashboard/session-reports", {
      params,
    }),
};
