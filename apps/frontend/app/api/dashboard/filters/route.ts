import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch all unique combinations of city, department, and unit from STAFF users
        const users = await prisma.user.findMany({
            where: {
                role: 'STAFF',
            },
            select: {
                city: true,
                department: true,
                unit: true,
            },
        });

        const hierarchy: Record<string, Record<string, Set<string>>> = {};

        users.forEach(user => {
            const city = user.city || 'Unknown City';
            const dept = user.department || 'Unknown Department';
            const unit = user.unit || 'Unknown Unit';

            if (!hierarchy[city]) {
                hierarchy[city] = {};
            }
            if (!hierarchy[city][unit]) {
                hierarchy[city][unit] = new Set();
            }
            hierarchy[city][unit].add(dept);
        });

        // Convert Sets to Arrays for JSON serialization
        const result = Object.entries(hierarchy).map(([cityName, units]) => ({
            name: cityName,
            units: Object.entries(units).map(([unitName, departments]) => ({
                name: unitName,
                departments: Array.from(departments).sort()
            })).sort((a, b) => a.name.localeCompare(b.name))
        })).sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching filter data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch filter data' },
            { status: 500 }
        );
    }
}
