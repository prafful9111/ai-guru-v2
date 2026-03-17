import { NextResponse } from 'next/server';
import { MOCK_USERS, MOCK_SCENARIOS } from '@/lib/mock-data';

import { verifyToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    let userDepartment: string | null = null;
    let userRole: string | null = null;

    if (token) {
      const payload = verifyToken(token);
      if (payload?.userId) {
        const user = MOCK_USERS.find(u => u.id === payload.userId);
        userDepartment = user?.department || null;
        userRole = user?.role || null;
      }
    }

    let scenarios = [...MOCK_SCENARIOS];

    if (userRole !== 'ADMIN') {
      if (userDepartment) {
        scenarios = scenarios.filter(s => s.departments.includes(userDepartment as string));
      } else {
        // If a staff user has no department, they shouldn't see any scenarios based on "from his department only"
        return NextResponse.json([]);
      }
    }

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}
