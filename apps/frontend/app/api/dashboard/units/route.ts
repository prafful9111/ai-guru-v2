import { NextResponse } from 'next/server';
import { MOCK_UNITS } from '@/lib/mock-data';

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

        if (singleId) {
            const unit = MOCK_UNITS.find(u => u.id === singleId || u.name === singleId);
            if (!unit) {
                return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
            }
            return NextResponse.json({ data: unit });
        }

        let filteredUnits = [...MOCK_UNITS];
        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredUnits = filteredUnits.filter(u => u.name.toLowerCase().includes(lowerSearch));
        }

        const total = filteredUnits.length;
        filteredUnits.sort((a, b) => a.name.localeCompare(b.name));
        
        const paginatedData = filteredUnits.slice(skip, skip + limit);

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
