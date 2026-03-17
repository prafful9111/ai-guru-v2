import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const singleId = searchParams.get('id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        // 1. Get staff counts per department (always needed)
        const staffByDept = await prisma.user.groupBy({
            by: ['department'],
            _count: {
                _all: true
            },
            where: {
                role: 'STAFF',
                department: { not: null }
            }
        });

        const staffCounts = staffByDept.reduce((acc, curr) => {
            if (curr.department) {
                acc[curr.department] = curr._count._all;
            }
            return acc;
        }, {} as Record<string, number>);

        // Calculate total staff for scenarios with no specific department mapping
        const totalStaffCountInSystem = await prisma.user.count({
            where: { role: 'STAFF' },
        });

        if (singleId) {
            const scenario = await prisma.scenario.findUnique({
                where: { id: singleId },
                select: {
                    id: true,
                    title: true,
                    departments: true,
                    sessions: {
                        where: {
                            user: {
                                role: 'STAFF'
                            }
                        },
                        select: {
                            assessmentScores: true,
                        },
                    },
                },
            });

            if (!scenario) {
                return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
            }

            let passedCount = 0;
            let failedCount = 0;

            scenario.sessions.forEach((session) => {
                const scores = session.assessmentScores as any;
                if (scores?.pass_fail === 'Pass') passedCount++;
                else if (scores?.pass_fail === 'Fail') failedCount++;
            });

            let assignedCount = totalStaffCountInSystem;
            if (scenario.departments && scenario.departments.length > 0) {
                assignedCount = scenario.departments.reduce((sum: number, dept: string) => sum + (staffCounts[dept] || 0), 0);
            }

            return NextResponse.json({
                data: {
                    id: scenario.id,
                    title: scenario.title,
                    assignedCount: assignedCount,
                    attemptedCount: scenario.sessions.length,
                    passedCount,
                    failedCount,
                }
            });
        }

        // Search condition
        const where: any = { isActive: true };
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        // 2. Fetch total active scenarios count
        const totalScenariosCount = await prisma.scenario.count({
            where,
        });

        // 3. Fetch paginated active scenarios with their sessions
        const scenariosList = await prisma.scenario.findMany({
            where,
            select: {
                id: true,
                title: true,
                departments: true,
                sessions: {
                    where: {
                        user: {
                            role: 'STAFF'
                        }
                    },
                    select: {
                        assessmentScores: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'asc',
            },
        });

        // 4. Format the response
        const formattedScenarios = scenariosList.map((scenario) => {
            let passedCount = 0;
            let failedCount = 0;

            scenario.sessions.forEach((session) => {
                const scores = session.assessmentScores as any;
                if (scores?.pass_fail === 'Pass') {
                    passedCount++;
                } else if (scores?.pass_fail === 'Fail') {
                    failedCount++;
                }
            });

            let assignedCount = totalStaffCountInSystem;
            if (scenario.departments && scenario.departments.length > 0) {
                assignedCount = scenario.departments.reduce((sum: number, dept: string) => sum + (staffCounts[dept] || 0), 0);
            }

            return {
                id: scenario.id,
                title: scenario.title,
                assignedCount: assignedCount,
                attemptedCount: scenario.sessions.length,
                passedCount,
                failedCount,
            };
        });

        return NextResponse.json({
            data: formattedScenarios,
            meta: {
                total: totalScenariosCount,
                page,
                limit,
                totalPages: Math.ceil(totalScenariosCount / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard scenarios:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard scenarios' },
            { status: 500 }
        );
    }
}
