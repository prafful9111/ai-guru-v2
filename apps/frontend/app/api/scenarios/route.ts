import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

import { verifyToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    let userDepartment = null;
    let userRole = null;

    if (token) {
      const payload = verifyToken(token);
      if (payload?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { department: true, role: true }
        });
        userDepartment = user?.department;
        userRole = user?.role;
      }
    }

    const whereClause: any = { isActive: true };

    if (userRole !== 'ADMIN') {
      if (userDepartment) {
        whereClause.departments = { has: userDepartment };
      } else {
        // If a staff user has no department, they shouldn't see any scenarios based on "from his department only"
        return NextResponse.json([]);
      }
    }

    const scenarios = await prisma.scenario.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}
