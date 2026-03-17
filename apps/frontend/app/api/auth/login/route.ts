import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/token';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.identifier || body.email;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing identifier or password' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
          { staffId: identifier }
        ]
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Staff cannot login with email
    const isEmail = identifier.includes('@');
    if (user.role === 'STAFF' && isEmail) {
      return NextResponse.json({ error: 'Staff must login using Phone Number or Staff ID' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email!, role: user.role, department: user.department });

    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Don't return the password
    const { password: _, ...userProfile } = user;

    return NextResponse.json({ user: userProfile }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
