import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded || decoded.role !== 'VENUE_OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const ownerId = decoded.id;

    const venue = await prisma.venue.findFirst({
      where: { ownerId },
      include: {
        courts: {
          include: {
            timeSlots: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ message: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ courts: venue.courts });
  } catch (error) {
    console.error('Time slots fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded || decoded.role !== 'VENUE_OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { courtId, daySchedules } = await req.json();

    if (!courtId || !daySchedules || !Array.isArray(daySchedules)) {
      return NextResponse.json({ message: 'Invalid data provided' }, { status: 400 });
    }

    // Verify court ownership
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        venue: {
          select: { ownerId: true },
        },
      },
    });

    if (!court || court.venue.ownerId !== decoded.id) {
      return NextResponse.json({ message: 'Unauthorized or court not found' }, { status: 403 });
    }

    // Perform update in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing time slots for this court
      await tx.timeSlot.deleteMany({
        where: { courtId },
      });

      // 2. Generate new time slots based on schedules
      const newTimeSlots = [];

      for (const schedule of daySchedules) {
        const { dayOfWeek, openTime, closeTime, blockedSlots } = schedule;
        
        if (!openTime || !closeTime) continue;

        const openHour = parseInt(openTime.split(':')[0]);
        const closeHour = parseInt(closeTime.split(':')[0]);

        for (let hour = openHour; hour < closeHour; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
          const isBlocked = blockedSlots.includes(startTime);

          newTimeSlots.push({
            courtId,
            startTime,
            endTime,
            dayOfWeek,
            isAvailable: !isBlocked,
          });
        }
      }

      if (newTimeSlots.length > 0) {
        await tx.timeSlot.createMany({
          data: newTimeSlots,
        });
      }
    });

    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Time slots update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
