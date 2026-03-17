import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Mocked dashboard statistics
        return NextResponse.json({
            totalUsers: 156,
            totalAssessments: 1250,
            uniqueUsers: 140,
            passFail: {
                pass: 950,
                fail: 300
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
