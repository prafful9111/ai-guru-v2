import { NextResponse } from 'next/server';
import { MOCK_USERS } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = MOCK_USERS.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = {
      id: `mock_user_${Date.now()}`,
      email,
      password, // Storing plaintext for mock
      name,
      role: role || 'STAFF',
      department: null,
      staffId: `STAFF-${Math.floor(Math.random() * 1000)}`,
      phoneNumber: `555${Math.floor(Math.random() * 1000000)}`,
    };

    MOCK_USERS.push(newUser);

    const { password: _, ...userProfile } = newUser;

    return NextResponse.json({ user: userProfile }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
