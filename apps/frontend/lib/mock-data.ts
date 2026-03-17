export const MOCK_USERS = [
  {
    id: "user_admin_1",
    email: "admin@flabs.com",
    name: "Admin User",
    role: "ADMIN",
    department: null,
    staffId: "ADMIN-001",
    phoneNumber: "1234567890",
    password: "password123", // In actual DB this would be hashed, we'll bypass bcrypt in mock login
  },
  {
    id: "user_staff_1",
    email: "staff1@flabs.com",
    name: "John Doe",
    role: "STAFF",
    department: "Cardiology",
    staffId: "STAFF-001",
    phoneNumber: "0987654321",
    password: "password123",
  },
  {
    id: "user_staff_2",
    email: "staff2@flabs.com",
    name: "Jane Smith",
    role: "STAFF",
    department: "Neurology",
    staffId: "STAFF-002",
    phoneNumber: "1122334455",
    password: "password123",
  }
];

export const MOCK_STATS = {
  totalStaff: 150,
  activeScenarios: 12,
  totalSessions: 1250,
  averageScore: 85.5,
  completionRate: 92.3,
  recentActivity: [
    { id: "act1", userId: "user_staff_1", action: "Completed Scenario A", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "act2", userId: "user_staff_2", action: "Started Scenario B", timestamp: new Date(Date.now() - 7200000).toISOString() },
  ]
};

export const MOCK_SCENARIOS = [
  {
    id: "scenario_1",
    title: "Basic Life Support",
    description: "Standard BLS protocol training.",
    assignedCount: 50,
    attemptedCount: 45,
    passedCount: 40,
    failedCount: 5,
    departments: ["Cardiology", "Neurology", "Emergency"]
  },
  {
    id: "scenario_2",
    title: "Advanced Cardiac Life Support",
    description: "ACLS protocol training.",
    assignedCount: 30,
    attemptedCount: 25,
    passedCount: 20,
    failedCount: 5,
    departments: ["Cardiology", "Emergency"]
  }
];

export const MOCK_STAFF = [
  {
    id: "user_staff_1",
    name: "John Doe",
    role: "STAFF",
    staffId: "STAFF-001",
    assigned: 5,
    attempted: 4,
    passed: 3,
    failed: 1,
    city: "Mumbai",
    department: "Cardiology",
    unit: "Unit A"
  },
  {
    id: "user_staff_2",
    name: "Jane Smith",
    role: "STAFF",
    staffId: "STAFF-002",
    assigned: 3,
    attempted: 3,
    passed: 3,
    failed: 0,
    city: "Delhi",
    department: "Neurology",
    unit: "Unit B"
  }
];

export const MOCK_CITIES = [
  { id: "city_1", name: "Mumbai", staffCount: 80, assigned: 150, attempted: 140, passed: 130, failed: 10 },
  { id: "city_2", name: "Delhi", staffCount: 70, assigned: 120, attempted: 110, passed: 100, failed: 10 }
];

export const MOCK_DEPARTMENTS = [
  { id: "dept_1", name: "Cardiology", staffCount: 60, assigned: 100, attempted: 95, passed: 90, failed: 5 },
  { id: "dept_2", name: "Neurology", staffCount: 40, assigned: 80, attempted: 75, passed: 70, failed: 5 },
  { id: "dept_3", name: "Emergency", staffCount: 50, assigned: 90, attempted: 80, passed: 70, failed: 10 }
];

export const MOCK_UNITS = [
  { id: "unit_1", name: "Unit A", staffCount: 50, assigned: 90, attempted: 85, passed: 80, failed: 5 },
  { id: "unit_2", name: "Unit B", staffCount: 100, assigned: 180, attempted: 165, passed: 150, failed: 15 }
];

export const MOCK_SESSION_REPORTS = [
    {
        id: "session_1",
        userId: "user_staff_1",
        scenarioId: "scenario_1",
        status: "completed",
        difficultyLevel: "intermediate",
        language: "en",
        totalDurationSeconds: 1200,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 2 + 1200000).toISOString(),
    },
    {
        id: "session_2",
        userId: "user_staff_2",
        scenarioId: "scenario_2",
        status: "completed",
        difficultyLevel: "advanced",
        language: "en",
        totalDurationSeconds: 1500,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000 + 1500000).toISOString(),
    }
];
