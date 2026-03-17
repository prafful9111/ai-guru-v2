import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let singleId = searchParams.get('id'); // The unit name
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        // format the id: 
        singleId = decodeURIComponent(singleId || '');

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

        // 2. Fetch all STAFF users who have a unit
        const where: any = { role: 'STAFF', unit: { not: null, notIn: [""] } };
        if (search) {
            where.unit = { contains: search, mode: 'insensitive' };
        }

        const staffUsers = await prisma.user.findMany({
            where,
            select: {
                unit: true,
                department: true,
                sessions: {
                    select: {
                        assessmentScores: true,
                    },
                },
            },
        });

        // 3. Aggregate data by unit
        const unitMap: Record<string, any> = {};

        staffUsers.forEach((user) => {
            const unitName = user.unit || 'Unknown';
            if (!unitMap[unitName]) {
                unitMap[unitName] = {
                    id: unitName,
                    name: unitName,
                    staffCount: 0,
                    assigned: 0,
                    attempted: 0,
                    passed: 0,
                    failed: 0,
                };
            }

            const unitData = unitMap[unitName];
            unitData.staffCount++;

            // Assigned scenarios based on department
            if (user.department && deptScenariosCount[user.department]) {
                unitData.assigned += deptScenariosCount[user.department];
            }

            // Session stats
            unitData.attempted += user.sessions.length;
            user.sessions.forEach((session) => {
                const scores = session.assessmentScores as any;
                if (scores?.pass_fail === 'Pass') {
                    unitData.passed++;
                } else if (scores?.pass_fail === 'Fail') {
                    unitData.failed++;
                }
            });
        });

        // 4. Convert to array, sort, and paginate
        const unitsArray = Object.values(unitMap).sort((a, b) => a.name.localeCompare(b.name));

        if (singleId) {
            const unit = unitsArray.find(u => u.id === singleId);
            if (!unit) {
                return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
            }
            return NextResponse.json({ data: unit });
        }

        const total = unitsArray.length;
        const paginatedData = unitsArray.slice(skip, skip + limit);

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
        console.error('Error fetching unit stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unit stats' },
            { status: 500 }
        );
    }
}
