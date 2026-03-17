import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/services/dashboard";

// Staff stats hook
export const useStaffs = (
  page = 1,
  limit = 10,
  search = "",
  filters?: { city?: string; department?: string; unit?: string },
) => {
  return useQuery({
    queryKey: ["staffRecords", page, limit, search, filters],
    queryFn: () =>
      dashboardService.getStaffRecords({
        page,
        limit,
        search,
        city: filters?.city,
        department: filters?.department,
        unit: filters?.unit,
      }),
  });
};

// Single staff hook
export const useStaff = (id: string | null) => {
  return useQuery({
    queryKey: ["staffRecord", id],
    queryFn: () => dashboardService.getStaffRecord(id!),
    enabled: !!id,
  });
};

// Detailed staff assignments hook
export const useStaffAssignments = (employeeId: string | null) => {
  return useQuery({
    queryKey: ["staffAssignments", employeeId],
    queryFn: () => dashboardService.getStaffAssignments(employeeId!),
    enabled: !!employeeId,
  });
};

// Scenario stats hook
export const useScenarios = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["scenarioRecords", page, limit, search],
    queryFn: () => dashboardService.getScenarioRecords({ page, limit, search }),
  });
};

// Single scenario hook
export const useScenario = (id: string | null) => {
  return useQuery({
    queryKey: ["scenarioRecord", id],
    queryFn: () => dashboardService.getScenarioRecord(id!),
    enabled: !!id,
  });
};

/* // City stats hook
export const useCities = (page = 1, limit = 10, search = '') => {
    return useQuery({
        queryKey: ['cityRecords', page, limit, search],
        queryFn: () => dashboardService.getCityRecords({ page, limit, search }),
    });
};

// Single city hook
export const useCity = (id: string | null) => {
    return useQuery({
        queryKey: ['cityRecord', id],
        queryFn: () => dashboardService.getCityRecord(id!),
        enabled: !!id,
    });
};

// Department stats hook
export const useDepartments = (page = 1, limit = 10, search = '') => {
    return useQuery({
        queryKey: ['deptRecords', page, limit, search],
        queryFn: () => dashboardService.getDepartmentRecords({ page, limit, search }),
    });
};

// Single department hook
export const useDepartment = (id: string | null) => {
    return useQuery({
        queryKey: ['deptRecord', id],
        queryFn: () => dashboardService.getDepartmentRecord(id!),
        enabled: !!id,
    });
};

// Detailed department assignments hook
export const useDepartmentAssignments = (deptId: string | null, page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['deptAssignments', deptId, page, limit],
        queryFn: () => dashboardService.getDepartmentAssignments(deptId!, { page, limit }),
        enabled: !!deptId,
    });
};

// Detailed city assignments hook
export const useCitiesAssignment = (cityId: string | null, page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['cityAssignments', cityId, page, limit],
        queryFn: () => dashboardService.getCityAssignments(cityId!, { page, limit }),
        enabled: !!cityId,
    });
}; */

// Detailed scenario attempts hook
export const useScenarioAssignments = (
  scenarioId: string | null,
  page = 1,
  limit = 10,
) => {
  return useQuery({
    queryKey: ["scenarioAssignments", scenarioId, page, limit],
    queryFn: () =>
      dashboardService.getScenarioAssignments(scenarioId!, { page, limit }),
    enabled: !!scenarioId,
  });
};

/* // Unit stats hook
export const useUnits = (page = 1, limit = 10, search = '') => {
    return useQuery({
        queryKey: ['unitRecords', page, limit, search],
        queryFn: () => dashboardService.getUnitRecords({ page, limit, search }),
    });
};

// Single unit hook
export const useUnit = (id: string | null) => {
    return useQuery({
        queryKey: ['unitRecord', id],
        queryFn: () => dashboardService.getUnitRecord(id!),
        enabled: !!id,
    });
};

// Detailed unit assignments hook
export const useUnitAssignments = (unitId: string | null, page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['unitAssignments', unitId, page, limit],
        queryFn: () => dashboardService.getUnitAssignments(unitId!, { page, limit }),
        enabled: !!unitId,
    });
}; */

// Report data hook for individual attempt
export const useAttemptDetails = (attemptId: string) => {
  return useQuery({
    queryKey: ["attemptDetails", attemptId],
    queryFn: () => dashboardService.getAttemptDetails(attemptId),
    enabled: !!attemptId,
  });
};

// Dashboard KPI stats hook
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardService.getDashboardStats(),
  });
};

// Filter hook
export const useFilters = () => {
  return useQuery({
    queryKey: ["dashboardFilters"],
    queryFn: () => dashboardService.getFilters(),
  });
};

// Scenarios list hook for filter dropdown
export const useScenariosList = () => {
  return useQuery({
    queryKey: ["scenariosList"],
    queryFn: () => dashboardService.getScenariosList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Session reports hook
export const useSessionReports = (
  page = 1,
  limit = 10,
  search = "",
  filters?: {
    city?: string;
    unit?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    ragStatus?: string;
    scenarioId?: string;
    difficulty?: string;
  },
) => {
  return useQuery({
    queryKey: ["sessionReports", page, limit, search, filters],
    queryFn: () =>
      dashboardService.getSessionReports({
        page,
        limit,
        search,
        city: filters?.city,
        unit: filters?.unit,
        department: filters?.department,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        ragStatus: filters?.ragStatus,
        scenarioId: filters?.scenarioId,
        difficulty: filters?.difficulty,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
