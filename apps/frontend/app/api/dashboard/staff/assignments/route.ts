import { NextResponse } from 'next/server';
import { MOCK_USERS, MOCK_SCENARIOS, MOCK_SESSION_REPORTS } from '@/lib/mock-data';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let employeeId = searchParams.get('employee_id');

        if (!employeeId) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
        }

        employeeId = decodeURIComponent(employeeId || '');

        // 1. Validate staff existence
        const staff = MOCK_USERS.find(u => u.id === employeeId);

        if (!staff) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        // 2. Fetch active scenarios that apply to this staff's department
        if (!staff.department) {
            return NextResponse.json([]);
        }

        const scenarios = MOCK_SCENARIOS;

        // 3. Fetch all sessions for this staff
        const sessions = MOCK_SESSION_REPORTS.filter(s => s.userId === employeeId);

        // 4. Map data to requested format
        const assignments = scenarios.map((scenario) => {
            // Filter sessions for this specific scenario
            const scenarioSessions = sessions.filter(s => s.scenarioId === scenario.id);

            // Determine status
            const status = scenarioSessions.length > 0 ? 'Attempted' : 'Pending';

            // Map attempts
            const attempts = scenarioSessions.map((session: any) => {
                // Mock passing values for simplicity
                const breakdown = {
                    parameters: { obtained: 50, total: 70 },
                    roleplay: { obtained: 10, total: 15 },
                    verbal: { obtained: 12, total: 15 }
                };

                return {
                    id: session.id,
                    date: new Date(session.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }),
                    status: "Pass",
                    totalScore: 72,
                    breakdown
                };
            });

            return {
                id: `assign-${staff.id}-${scenario.id}`,
                staffId: staff.id,
                staffName: staff.name,
                scenarioId: scenario.id,
                scenarioTitle: scenario.title,
                status,
                attempts
            };
        });

        return NextResponse.json(assignments);

    } catch (error) {
        console.error('Error fetching staff assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}
