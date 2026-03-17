import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let employeeId = searchParams.get('employee_id');

        if (!employeeId) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
        }

        employeeId = decodeURIComponent(employeeId || '');

        // 1. Validate staff existence
        const staff = await prisma.user.findUnique({
            where: { id: employeeId },
            select: { id: true, name: true, department: true }
        });

        if (!staff) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        // 2. Fetch active scenarios that apply to this staff's department
        const whereClause: any = { isActive: true };
        if (staff.department) {
            // No Need for this: As need to show all scenarios to for the staff
            // whereClause.departments = { has: staff.department };
        } else {
            // No department = no scenarios assigned
            return NextResponse.json([]);
        }

        const scenarios = await prisma.scenario.findMany({
            where: whereClause,
            select: { id: true, title: true }
        });

        // 3. Fetch all sessions for this staff
        const sessions = await prisma.assessmentSession.findMany({
            where: { userId: employeeId },
            orderBy: { startedAt: 'desc' },
            include: {
                scenario: true
            }
        });

        // 4. Map data to requested format
        const assignments = scenarios.map((scenario) => {
            // Filter sessions for this specific scenario
            const scenarioSessions = sessions.filter(s => s.scenarioId === scenario.id);

            // Determine status
            const status = scenarioSessions.length > 0 ? 'Attempted' : 'Pending';

            // Map attempts
            const attempts = scenarioSessions.map((session) => {
                const scores = session.assessmentScores as any || {};

                // Extract or default breakdown values
                const breakdown = {
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
                };

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
                    totalScore: scores?.total_score,
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
