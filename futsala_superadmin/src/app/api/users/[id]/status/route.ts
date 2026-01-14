import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    // Allow both isVerified or isActive (common for status updates) to control the account status
    const isVerified = body.isVerified ?? body.isActive;

    if (typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid status provided. Expected boolean.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        isVerified,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
