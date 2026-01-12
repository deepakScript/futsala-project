import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password, phoneNumber } = await req.json();

    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: 'VENUE_OWNER', // Default to OWNER for this dashboard app
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ message: 'User created successfully', user: { id: user.id, name: user.fullName, email: user.email } });
    
    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
