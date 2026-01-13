import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify that the user is actually a venue owner
    const owner = await prisma.user.findFirst({
      where: { 
        id,
        role: 'VENUE_OWNER'
      }
    })

    if (!owner) {
      return NextResponse.json({ error: "Venue owner not found" }, { status: 404 })
    }

    // Fetch all venues for this owner
    const venues = await prisma.venue.findMany({
      where: { ownerId: id },
      include: {
        courts: {
          include: {
            bookings: true
          }
        }
      }
    })

    let totalRevenue = 0
    let totalBookings = 0
    let venuePerformance: any[] = []

    venues.forEach(venue => {
      let revenue = 0
      let bookingsCount = 0

      venue.courts.forEach(court => {
        court.bookings.forEach(booking => {
          if (booking.paymentStatus === 'PAID') {
            revenue += booking.totalPrice
          }
          bookingsCount++
        })
      })

      totalRevenue += revenue
      totalBookings += bookingsCount
      
      venuePerformance.push({
        id: venue.id,
        name: venue.name,
        revenue,
        bookingsCount,
        platformCommission: revenue * 0.1
      })
    })

    return NextResponse.json({
      performance: {
        totalRevenue,
        totalBookings,
        platformCommission: totalRevenue * 0.1,
        netOwnerEarnings: totalRevenue * 0.9,
        venueBreakdown: venuePerformance
      }
    })
  } catch (error) {
    console.error("Fetch Owner Performance Error:", error)
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 })
  }
}
