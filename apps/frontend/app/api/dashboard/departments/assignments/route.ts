import { NextResponse } from 'next/server';
import { MOCK_USERS, MOCK_SCENARIOS, MOCK_SESSION_REPORTS } from '@/lib/mock-data';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let deptId = searchParams.get('dept_id'); // This is the department name
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        if (!deptId) {
            return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
        }

        deptId = decodeURIComponent(deptId || '');

        const scenarios = MOCK_SCENARIOS.filter(s => s.departments.includes(deptId as string));

        const staffMembers = MOCK_USERS.filter(u => u.role === 'STAFF' && u.department === deptId);

        const assignments: any[] = [];
        staffMembers.forEach((staff) => {
            scenarios.forEach((scenario) => {
                const staffScenarioSessions = MOCK_SESSION_REPORTS.filter(s =>
                    s.userId === staff.id && s.scenarioId === scenario.id
                );

                const status = staffScenarioSessions.length > 0 ? 'Attempted' : 'Pending';

                const attempts = staffScenarioSessions.map((session: any) => {
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
                        totalScore: 78,
                        breakdown: {
                            parameters: { obtained: 55, total: 70 },
                            roleplay: { obtained: 13, total: 15 },
                            verbal: { obtained: 10, total: 15 }
                        }
                    };
                });

                assignments.push({
                    id: `assign-${staff.id}-${scenario.id}`,
                    staffId: staff.id,
                    staffName: staff.name,
                    scenarioId: scenario.id,
                    scenarioTitle: scenario.title,
                    status,
                    attempts
                });
            });
        });

        const total = assignments.length;
        const paginatedData = assignments.slice(skip, skip + limit);

        return NextResponse.json({
            data: paginatedData,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching department assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}
