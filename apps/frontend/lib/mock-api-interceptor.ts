import { 
  MOCK_USERS, MOCK_SCENARIOS, MOCK_SESSION_REPORTS, MOCK_STATS 
} from './mock-data';

export async function interceptRequest(method: string, endpoint: string, data?: any, params?: any): Promise<any> {
  console.log(`[Mock Client API] Intercepting ${method} ${endpoint}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // --- GET REQUESTS ---
  if (method === 'GET') {
    if (endpoint === '/api/dashboard/stats') {
      return MOCK_STATS;
    }

    if (endpoint === '/api/dashboard/scenarios-list') {
      return MOCK_SCENARIOS.map(s => ({ id: s.id, name: s.title }));
    }

    if (endpoint === '/api/auth/me') {
      const token = localStorage.getItem('mock_token');
      if (!token) throw new Error("Unauthorized");
      const user = MOCK_USERS.find(u => u.id === token);
      if (!user) throw new Error("User not found");
      const { password, ...rest } = user;
      return { user: rest };
    }

    if (endpoint === '/api/scenarios') {
      return MOCK_SCENARIOS; 
    }

    if (endpoint === '/api/dashboard/filters') {
       const hierarchy: Record<string, Record<string, Set<string>>> = {};
       const users = MOCK_USERS.filter(u => u.role === 'STAFF');
       users.forEach(user => {
           const city = (user as any).city || 'Unknown City';
           const dept = user.department || 'Unknown Department';
           const unit = (user as any).unit || 'Unknown Unit';
           if (!hierarchy[city]) hierarchy[city] = {};
           if (!hierarchy[city][unit]) hierarchy[city][unit] = new Set();
           hierarchy[city][unit].add(dept);
       });
       return Object.entries(hierarchy).map(([cityName, units]) => ({
           name: cityName,
           units: Object.entries(units).map(([unitName, departments]) => ({
               name: unitName,
               departments: Array.from(departments).sort()
           })).sort((a, b) => a.name.localeCompare(b.name))
       })).sort((a, b) => a.name.localeCompare(b.name));
    }

    if (endpoint.startsWith('/api/dashboard/staff/assignments')) {
      const employeeId = params?.employee_id;
      const staff = MOCK_USERS.find(u => u.id === employeeId);
      if (!staff || !staff.department) return [];
      
      const sessions = MOCK_SESSION_REPORTS.filter(s => s.userId === employeeId);
      return MOCK_SCENARIOS.map(scenario => {
          const scenarioSessions = sessions.filter(s => s.scenarioId === scenario.id);
          const status = scenarioSessions.length > 0 ? 'Attempted' : 'Pending';
          const attempts = scenarioSessions.map(session => ({
              id: session.id,
              date: new Date(session.createdAt).toLocaleString(),
              status: "Pass",
              totalScore: 72,
              breakdown: { parameters: { obtained: 50, total: 70 }, roleplay: { obtained: 10, total: 15 }, verbal: { obtained: 12, total: 15 } }
          }));
          return { id: `assign-${staff.id}-${scenario.id}`, staffId: staff.id, staffName: staff.name, scenarioId: scenario.id, scenarioTitle: scenario.title, status, attempts };
      });
    }

    if (endpoint.startsWith('/api/dashboard/staff')) {
       if (params?.id) {
         // Single staff
         const staff = MOCK_USERS.find(u => u.id === params.id && u.role === 'STAFF');
         if (!staff) throw new Error("Not found");
         return { data: staff };
       }
       // List staff
       const page = params?.page || 1;
       const limit = params?.limit || 10;
       const search = params?.search?.toLowerCase();
       let filtered = MOCK_USERS.filter(u => u.role === 'STAFF');
       if (search) filtered = filtered.filter(u => u.name.toLowerCase().includes(search));
       if (params?.city) filtered = filtered.filter(u => (u as any).city === params.city);
       if (params?.department) filtered = filtered.filter(u => u.department === params.department);
       if (params?.unit) filtered = filtered.filter(u => (u as any).unit === params.unit);
       
       const total = filtered.length;
       const data = filtered.slice((page-1)*limit, page*limit).map(u => ({
           id: u.id, staffId: u.staffId, name: u.name, role: u.role, assigned: 5, attempted: 3, passed: 2, failed: 1
       }));
       return { data, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } };
    }

    if (endpoint.startsWith('/api/dashboard/scenarios/assignments')) {
      const scenarioId = params?.scenario_id;
      const scenario = MOCK_SCENARIOS.find(s => s.id === scenarioId);
      if (!scenario) return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      
      const staffMembers = MOCK_USERS.filter(u => u.role === 'STAFF' && u.department && scenario.departments.includes(u.department));
      const assignments = staffMembers.map(staff => {
         const staffSessions = MOCK_SESSION_REPORTS.filter(s => s.userId === staff.id && s.scenarioId === scenarioId);
         const status = staffSessions.length > 0 ? 'Attempted' : 'Pending';
         const attempts = staffSessions.map(session => ({
             id: session.id, date: new Date(session.createdAt).toLocaleString(), status: "Pass", totalScore: 71,
             breakdown: { parameters: { obtained: 52, total: 70 }, roleplay: { obtained: 10, total: 15 }, verbal: { obtained: 9, total: 15 } }
         }));
         return { id: `assign-${staff.id}-${scenario.id}`, staffId: staff.id, staffName: staff.name, scenarioId: scenario.id, scenarioTitle: scenario.title, status, attempts };
      });
      return { data: assignments, meta: { total: assignments.length, page: 1, limit: 100, totalPages: 1 } };
    }

    if (endpoint.startsWith('/api/dashboard/scenarios')) {
      if (params?.id) {
         const scenario = MOCK_SCENARIOS.find(s => s.id === params.id);
         if (!scenario) throw new Error("Not found");
         return { data: scenario };
      }
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const total = MOCK_SCENARIOS.length;
      return {
          data: MOCK_SCENARIOS.slice((page-1)*limit, page*limit),
          meta: { total, page, limit, totalPages: Math.ceil(total/limit) }
      };
    }

    if (endpoint.startsWith('/api/dashboard/session-reports')) {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const total = MOCK_SESSION_REPORTS.length;
      
      const mappedData = MOCK_SESSION_REPORTS.slice((page-1)*limit, page*limit).map(report => {
         const user = MOCK_USERS.find(u => u.id === report.userId);
         const scenario = MOCK_SCENARIOS.find(s => s.id === report.scenarioId);
         return {
            ...report,
            sessionId: report.id,
            dateTime: report.createdAt,
            completedAt: report.completedAt,
            difficulty: report.difficultyLevel,
            language: report.language,
            status: report.status,
            totalDurationSeconds: report.totalDurationSeconds,
            userId: report.userId,
            staffId: user?.staffId || null,
            userName: user?.name || "Unknown",
            userDepartment: user?.department || null,
            userUnit: (user as any)?.unit || null,
            scenarioId: report.scenarioId,
            scenarioTitle: scenario?.title || "Unknown Scenario",
            finalScore: 85,
            parameterScore: 80,
            sopScore: 90,
            ragStatus: "GREEN",
            audioUrl: null,
            hasVideo: false
         };
      });

      return {
          data: mappedData,
          meta: { total, page, limit, totalPages: Math.ceil(total/limit) },
          stats: { total, green: total, amber: 0, red: 0 }
      };
    }

    if (endpoint.startsWith('/api/admin/users')) {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      let filtered = MOCK_USERS;
      if (params?.search) filtered = filtered.filter(u => u.name.toLowerCase().includes(params.search.toLowerCase()));
      if (params?.role) filtered = filtered.filter(u => u.role === params.role);
      
      const total = filtered.length;
      return {
        data: filtered.slice((page-1)*limit, page*limit),
        meta: { total, page, limit, totalPages: Math.ceil(total/limit) }
      };
    }
  }

  // --- POST REQUESTS ---
  if (method === 'POST') {
    if (endpoint === '/api/auth/login') {
      const identifier = data?.identifier || data?.email;
      const password = data?.password;
      const user = MOCK_USERS.find(u => u.email === identifier || u.phoneNumber === identifier || u.staffId === identifier);
      if (!user || user.password !== password) throw new Error("Invalid credentials");
      const { password: _, ...rest } = user;
      
      // We can't set exact cookies easily on client, so we pretend it succeeded.
      // Next.js client component won't see cookies directly, but token is usually read differently. Wait,
      // the auth context might rely on the token. For full offline we use localStorage.
      localStorage.setItem('mock_token', user.id);
      return { user: rest };
    }

    if (endpoint === '/api/auth/logout') {
      localStorage.removeItem('mock_token');
      return { success: true };
    }
  }

  console.warn(`[Mock API] Endpoint not explicitly intercepted: ${endpoint}. Returning empty object.`);
  return {};
}
