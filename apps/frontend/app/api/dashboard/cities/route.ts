import { NextResponse } from 'next/server';
import { MOCK_CITIES } from '@/lib/mock-data';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const singleId = searchParams.get('id'); // The city name
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        if (singleId) {
            const city = MOCK_CITIES.find(c => c.id === singleId || c.name === singleId);
            if (!city) {
                return NextResponse.json({ error: 'City not found' }, { status: 404 });
            }
            return NextResponse.json({ data: city });
        }

        let filteredCities = [...MOCK_CITIES];
        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredCities = filteredCities.filter(c => c.name.toLowerCase().includes(lowerSearch));
        }

        const total = filteredCities.length;
        filteredCities.sort((a, b) => a.name.localeCompare(b.name));
        
        const paginatedData = filteredCities.slice(skip, skip + limit);

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
