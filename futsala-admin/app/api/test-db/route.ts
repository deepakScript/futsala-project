import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt a simple query to verify connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    // Also check if we can access a model
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'success',
      message: 'Database connection verified',
      data: {
        rawQuery: result,
        userCount: userCount,
        envCheck: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'
      }
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      meta: error.meta,
      envCheck: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'
    }, { status: 500 });
  }
}
