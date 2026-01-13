import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive } = await request.json();

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        isActive,
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
