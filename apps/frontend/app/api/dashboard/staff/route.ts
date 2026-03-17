import { NextResponse } from 'next/server';
import { MOCK_STAFF } from '@/lib/mock-data';

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

        if (singleId) {
            const user = MOCK_STAFF.find(s => s.id === singleId);

            if (!user) {
                return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
            }

            return NextResponse.json({
                data: user
            });
        }

        // Search and Filter conditions
        let filteredStaff = [...MOCK_STAFF];

        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredStaff = filteredStaff.filter(s => 
                s.name.toLowerCase().includes(lowerSearch) || 
                s.staffId.toLowerCase().includes(lowerSearch)
            );
        }
        if (city) {
            filteredStaff = filteredStaff.filter(s => s.city === city);
        }
        if (department) {
            filteredStaff = filteredStaff.filter(s => s.department === department);
        }
        if (unit) {
            filteredStaff = filteredStaff.filter(s => s.unit === unit);
        }

        const totalStaff = filteredStaff.length;
        
        filteredStaff.sort((a, b) => a.name.localeCompare(b.name));
        
        const paginatedStaff = filteredStaff.slice(skip, skip + limit);

        return NextResponse.json({
            data: paginatedStaff,
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
