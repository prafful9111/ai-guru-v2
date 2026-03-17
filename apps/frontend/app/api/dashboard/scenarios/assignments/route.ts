import { NextResponse } from 'next/server';
import { MOCK_USERS, MOCK_SCENARIOS, MOCK_SESSION_REPORTS } from '@/lib/mock-data';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let scenarioId = searchParams.get('scenario_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        if (!scenarioId) {
            return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 });
        }

        scenarioId = decodeURIComponent(scenarioId || '');

        const scenario = MOCK_SCENARIOS.find(s => s.id === scenarioId);

        if (!scenario) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
        }

        const staffMembers = MOCK_USERS.filter(u => 
            u.role === 'STAFF' && u.department && scenario.departments.includes(u.department)
        );

        const totalStaffCount = staffMembers.length;
        const paginatedStaff = staffMembers.slice(skip, skip + limit);

        const assignments = paginatedStaff.map((staff) => {
            const staffSessions = MOCK_SESSION_REPORTS.filter(s => s.userId === staff.id && s.scenarioId === scenarioId);

            const status = staffSessions.length > 0 ? 'Attempted' : 'Pending';

            const attempts = staffSessions.map((session: any) => {
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
                    totalScore: 71,
                    breakdown: {
                        parameters: { obtained: 52, total: 70 },
                        roleplay: { obtained: 10, total: 15 },
                        verbal: { obtained: 9, total: 15 }
                    }
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

        return NextResponse.json({
            data: assignments,
            meta: {
                total: totalStaffCount,
                page,
                limit,
                totalPages: Math.ceil(totalStaffCount / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching staff assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}
