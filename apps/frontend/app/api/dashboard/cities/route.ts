import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const singleId = searchParams.get('id'); // The city name
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

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

        // 2. Fetch all STAFF users who have a city
        const where: any = { role: 'STAFF', city: { not: null, notIn: [""] } };
        if (search) {
            where.city = { contains: search, mode: 'insensitive' };
        }

        const staffUsers = await prisma.user.findMany({
            where,
            select: {
                city: true,
                department: true,
                sessions: {
                    select: {
                        assessmentScores: true,
                    },
                },
            },
        });

        // 3. Aggregate data by city
        const cityMap: Record<string, any> = {};

        staffUsers.forEach((user) => {
            const cityName = user.city || 'Unknown';
            if (!cityMap[cityName]) {
                cityMap[cityName] = {
                    id: cityName,
                    name: cityName,
                    staffCount: 0,
                    assigned: 0,
                    attempted: 0,
                    passed: 0,
                    failed: 0,
                };
            }

            const cityData = cityMap[cityName];
            cityData.staffCount++;

            // Assigned scenarios based on department
            if (user.department && deptScenariosCount[user.department]) {
                cityData.assigned += deptScenariosCount[user.department];
            }

            // Session stats
            cityData.attempted += user.sessions.length;
            user.sessions.forEach((session) => {
                const scores = session.assessmentScores as any;
                if (scores?.pass_fail === 'Pass') {
                    cityData.passed++;
                } else if (scores?.pass_fail === 'Fail') {
                    cityData.failed++;
                }
            });
        });

        // 4. Convert to array, sort, and paginate
        const citiesArray = Object.values(cityMap).sort((a, b) => a.name.localeCompare(b.name));

        if (singleId) {
            const city = citiesArray.find(c => c.id === singleId);
            if (!city) {
                return NextResponse.json({ error: 'City not found' }, { status: 404 });
            }
            return NextResponse.json({ data: city });
        }

        const total = citiesArray.length;
        const paginatedData = citiesArray.slice(skip, skip + limit);

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
        console.error('Error fetching city stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch city stats' },
            { status: 500 }
        );
    }
}
