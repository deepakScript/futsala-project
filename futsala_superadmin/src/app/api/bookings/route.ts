import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/bookings - List all bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venueId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    const where: any = {}

    if (venueId) {
      where.court = {
        venueId: venueId
      }
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { court: { name: { contains: search, mode: 'insensitive' } } },
        { otp: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.bookingDate = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        court: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Fetch Bookings Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
