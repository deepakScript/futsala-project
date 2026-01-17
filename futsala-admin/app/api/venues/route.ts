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
        courts: true,
      },
    });

    return NextResponse.json(venue);
  } catch (error) {
    console.error('Venue fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    const { id, name, address, phoneNumber, description, amenities, courts } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Venue ID is required' }, { status: 400 });
    }

    // Update Venue
    const updatedVenue = await prisma.venue.update({
      where: { id, ownerId: decoded.id },
      data: {
        name,
        address,
        phoneNumber,
        description,
        amenities,
      },
    });

    // Update/Create Courts
    if (courts && Array.isArray(courts)) {
      for (const court of courts) {
        if (court.id) {
          await prisma.court.update({
            where: { id: court.id },
            data: {
              name: court.name,
              pricePerHour: parseFloat(court.pricePerHour.toString()),
            },
          });
        } else {
          await prisma.court.create({
            data: {
              name: court.name,
              pricePerHour: parseFloat(court.pricePerHour.toString()),
              venueId: id,
            },
          });
        }
      }
    }

    return NextResponse.json(updatedVenue);
  } catch (error) {
    console.error('Venue update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
