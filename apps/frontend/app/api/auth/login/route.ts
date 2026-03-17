import { NextResponse } from 'next/server';
import { MOCK_USERS } from '@/lib/mock-data';
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

    // Mock search
    const user = MOCK_USERS.find(u => 
      u.email === identifier || 
      u.phoneNumber === identifier || 
      u.staffId === identifier
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Staff cannot login with email
    const isEmail = identifier.includes('@');
    if (user.role === 'STAFF' && isEmail) {
      return NextResponse.json({ error: 'Staff must login using Phone Number or Staff ID' }, { status: 403 });
    }

    // Mock password verification
    const isValid = password === user.password;

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
