import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let singleId = searchParams.get('id'); // The department name
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        // format the id: 
        singleId = singleId?.replace(/%20/g, ' ') || '';

        // 1. Fetch active scenarios and build department count map
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

        // 2. Fetch all STAFF users who have a department
        const where: any = { role: 'STAFF', department: { not: null, notIn: [""] } };
        if (search) {
            where.department = { contains: search, mode: 'insensitive' };
        }

        const staffUsers = await prisma.user.findMany({
            where,
            select: {
                department: true,
                sessions: {
                    select: {
                        assessmentScores: true,
                    },
                },
            },
        });

        // 3. Aggregate data by department
        const deptMap: Record<string, any> = {};

        staffUsers.forEach((user) => {
            const deptName = user.department || 'Unknown';
            if (!deptMap[deptName]) {
                deptMap[deptName] = {
                    id: deptName,
                    name: deptName,
                    staffCount: 0,
                    assigned: 0,
                    attempted: 0,
                    passed: 0,
                    failed: 0,
                };
            }

            const deptData = deptMap[deptName];
            deptData.staffCount++;

            // Assigned scenarios for this department
            if (deptScenariosCount[deptName]) {
                deptData.assigned += deptScenariosCount[deptName];
            }

            // Session stats
            deptData.attempted += user.sessions.length;
            user.sessions.forEach((session) => {
                const scores = session.assessmentScores as any;
                if (scores?.pass_fail === 'Pass') {
                    deptData.passed++;
                } else if (scores?.pass_fail === 'Fail') {
                    deptData.failed++;
                }
            });
        });

        // 4. Convert to array, sort, and paginate
        const deptsArray = Object.values(deptMap).sort((a, b) => a.name.localeCompare(b.name));

        if (singleId) {
            const dept = deptsArray.find(d => d.id === singleId);
            if (!dept) {
                return NextResponse.json({ error: 'Department not found' }, { status: 404 });
            }
            return NextResponse.json({ data: dept });
        }

        const total = deptsArray.length;
        const paginatedData = deptsArray.slice(skip, skip + limit);

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
        console.error('Error fetching department stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch department stats' },
            { status: 500 }
        );
    }
}
