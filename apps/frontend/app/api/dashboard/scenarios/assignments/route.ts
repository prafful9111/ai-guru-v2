import { User } from '@/types';
import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

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

        // 1. Fetch scenario details
        const scenario = await prisma.scenario.findUnique({
            where: { id: scenarioId },
            select: { id: true, title: true, departments: true }
        });

        if (!scenario) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
        }

        // 2. Total staff count for this scenario (all staff with role STAFF)
        const totalStaffCount = await prisma.user.count({
            where: { role: 'STAFF', department: { in: scenario.departments } }
        });

        // 3. Fetch paginated staff
        const staffMembers = await prisma.user.findMany({
            where: { role: 'STAFF', department: { in: scenario.departments } },
            select: { id: true, name: true },
            skip,
            take: limit,
            orderBy: { name: 'asc' }
        });

        const staffIds = staffMembers.map(s => s.id);

        // 4. Fetch sessions for these specific staff members and this scenario
        const sessions = await prisma.assessmentSession.findMany({
            where: {
                scenarioId: scenarioId,
                userId: { in: staffIds }
            },
            orderBy: { startedAt: 'desc' }
        });

        // 5. Map data to requested format
        const assignments = staffMembers.map((staff) => {
            // Filter sessions for this specific staff member
            const staffSessions = sessions.filter(s => s.userId === staff.id);

            // Determine status
            const status = staffSessions.length > 0 ? 'Attempted' : 'Pending';

            // Map attempts
            const attempts = staffSessions.map((session: any) => {
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
                    totalScore: scores?.total_score || 0,
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
