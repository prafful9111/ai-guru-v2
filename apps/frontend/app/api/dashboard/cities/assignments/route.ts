import { NextResponse } from 'next/server';
import { MOCK_USERS, MOCK_SCENARIOS, MOCK_SESSION_REPORTS } from '@/lib/mock-data';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let cityId = searchParams.get('city_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        if (!cityId) {
            return NextResponse.json({ error: 'City ID is required' }, { status: 400 });
        }

        cityId = decodeURIComponent(cityId || '');

        const staffMembers = MOCK_USERS.filter(u => u.role === 'STAFF' && (u as any).city === cityId);

        const assignments: any[] = [];
        staffMembers.forEach((staff) => {
            const assignedScenarios = MOCK_SCENARIOS.filter(s =>
                staff.department && s.departments.includes(staff.department)
            );

            assignedScenarios.forEach((scenario) => {
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
                        totalScore: 75,
                        breakdown: {
                            parameters: { obtained: 55, total: 70 },
                            roleplay: { obtained: 10, total: 15 },
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
        console.error('Error fetching city assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}
