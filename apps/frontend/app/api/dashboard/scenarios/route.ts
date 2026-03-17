import { NextResponse } from 'next/server';
import { MOCK_SCENARIOS } from '@/lib/mock-data';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const singleId = searchParams.get('id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        if (singleId) {
            const scenario = MOCK_SCENARIOS.find(s => s.id === singleId);

            if (!scenario) {
                return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
            }

            return NextResponse.json({
                data: scenario
            });
        }

        // Search condition
        let filteredScenarios = [...MOCK_SCENARIOS];
        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredScenarios = filteredScenarios.filter(s => s.title.toLowerCase().includes(lowerSearch));
        }

        const totalScenariosCount = filteredScenarios.length;
        const paginatedScenarios = filteredScenarios.slice(skip, skip + limit);

        return NextResponse.json({
            data: paginatedScenarios,
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
