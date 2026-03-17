import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const singleId = searchParams.get('id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const city = searchParams.get('city') || '';
        const department = searchParams.get('department') || '';
        const unit = searchParams.get('unit') || '';
        const skip = (page - 1) * limit;

        const scenarios = await prisma.scenario.findMany({
            where: { isActive: true },
            select: { departments: true }
        });

        const deptScenariosCount: Record<string, number> = {};
        scenarios.forEach(s => {
            if (s.departments && s.departments.length > 0) {
                s.departments.forEach(dept => {
                    deptScenariosCount[dept] = (deptScenariosCount[dept] || 0) + 1;
                });
            }
        });

        if (singleId) {
            const user = await prisma.user.findUnique({
                where: { id: singleId },
                select: {
                    id: true,
                    staffId: true,
                    name: true,
                    role: true,
                    department: true,
                    sessions: {
                        select: {
                            assessmentScores: true,
                            status: true,
                        },
                    },
                },
            });

            if (!user) {
                return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
            }

            let passed = 0;
            let failed = 0;
            user.sessions.forEach((session) => {
                const scores = session.assessmentScores as any;
                if (scores?.pass_fail === 'Pass') passed++;
                else if (scores?.pass_fail === 'Fail') failed++;
            });

            const assignedCount = (user.department && deptScenariosCount[user.department]) || 0;

            return NextResponse.json({
                data: {
                    id: user.id,
                    staffId: user.staffId,
                    name: user.name,
                    role: user.role,
                    assigned: assignedCount,
                    attempted: user.sessions.length,
                    passed,
                    failed,
                }
            });
        }

        // Search and Filter conditions
        const where: any = { role: 'STAFF' };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { staffId: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (city) {
            where.city = city;
        }
        if (department) {
            where.department = department;
        }
        if (unit) {
            where.unit = unit;
        }

        // 2. Fetch total count for pagination
        const totalStaff = await prisma.user.count({
            where,
        });

        // 3. Fetch paginated STAFF users with their sessions
        const staffUsers = await prisma.user.findMany({
            where,
            select: {
                id: true,
                staffId: true,
                name: true,
                role: true,
                department: true,
                city: true,
                unit: true,
                sessions: {
                    select: {
                        assessmentScores: true,
                        status: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                name: 'asc'
            }
        });

        // 4. Transform data
        const formattedData = staffUsers.map((user) => {
            let passed = 0;
            let failed = 0;

            user.sessions.forEach((session) => {
                const scores = session.assessmentScores as any;

                if (scores?.pass_fail === 'Pass') {
                    passed++;
                } else if (scores?.pass_fail === 'Fail') {
                    failed++;
                }
            });

            let assignedCount = 0;
            if (user.department && deptScenariosCount[user.department]) {
                assignedCount = deptScenariosCount[user.department] || 0;
            }

            return {
                id: user.id,
                staffId: user.staffId,
                name: user.name,
                role: user.role,
                city: user.city,
                department: user.department,
                unit: user.unit,
                assigned: assignedCount,
                attempted: user.sessions.length,
                passed,
                failed,
            };
        });

        return NextResponse.json({
            data: formattedData,
            meta: {
                total: totalStaff,
                page,
                limit,
                totalPages: Math.ceil(totalStaff / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching staff stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch staff stats' },
            { status: 500 }
        );
    }
}
