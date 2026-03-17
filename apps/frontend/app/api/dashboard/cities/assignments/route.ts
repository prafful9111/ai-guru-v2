import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

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

        // 1. Fetch all active scenarios and their departments
        const scenarios = await prisma.scenario.findMany({
            where: { isActive: true },
            select: { id: true, title: true, departments: true }
        });

        // 2. Total staff count in this city
        const totalStaffInCity = await prisma.user.count({
            where: { role: 'STAFF', city: cityId }
        });

        // 3. Fetch all staff in this city to build full assignment list
        const staffMembers = await prisma.user.findMany({
            where: { role: 'STAFF', city: cityId },
            select: { id: true, name: true, department: true },
            orderBy: { name: 'asc' }
        });

        const staffIds = staffMembers.map(s => s.id);

        // 4. Fetch all sessions for these staff members
        const sessions = await prisma.assessmentSession.findMany({
            where: {
                userId: { in: staffIds }
            },
            orderBy: { startedAt: 'desc' }
        });

        // 5. Map data to assignments format
        // For each staff member, we'll list their assigned scenarios and completion status
        const assignments: any[] = [];

        staffMembers.forEach((staff) => {
            // Find scenarios assigned to this staff member's department
            const assignedScenarios = scenarios.filter(s =>
                staff.department && s.departments.includes(staff.department)
            );

            assignedScenarios.forEach((scenario) => {
                const staffScenarioSessions = sessions.filter(s =>
                    s.userId === staff.id && s.scenarioId === scenario.id
                );

                const status = staffScenarioSessions.length > 0 ? 'Attempted' : 'Pending';

                const attempts = staffScenarioSessions.map((session: any) => {
                    const scores = session.assessmentScores as any || {};
                    return {
                        id: session.id,
                        date: new Date(session.startedAt).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }),
                        status: scores?.pass_fail,
                        totalScore: scores?.total_score || 0,
                        breakdown: {
                            parameters: {
                                obtained: scores?.score_breakdown?.parameters_points_out_of_70 || 0,
                                total: 70
                            },
                            roleplay: {
                                obtained: scores?.score_breakdown?.roleplay_points_out_of_15 || 0,
                                total: 15
                            },
                            verbal: {
                                obtained: scores?.score_breakdown?.examiner_sop_points_out_of_15 || 0,
                                total: 15
                            }
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
