import { NextResponse } from 'next/server';
import { MOCK_DEPARTMENTS } from '@/lib/mock-data';

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

        if (singleId) {
            const dept = MOCK_DEPARTMENTS.find(d => d.id === singleId || d.name === singleId);
            if (!dept) {
                return NextResponse.json({ error: 'Department not found' }, { status: 404 });
            }
            return NextResponse.json({ data: dept });
        }

        let filteredDepts = [...MOCK_DEPARTMENTS];
        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredDepts = filteredDepts.filter(d => d.name.toLowerCase().includes(lowerSearch));
        }

        const total = filteredDepts.length;
        filteredDepts.sort((a, b) => a.name.localeCompare(b.name));
        
        const paginatedData = filteredDepts.slice(skip, skip + limit);

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
