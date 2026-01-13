import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const [
      totalVenues,
      activeVenueOwners,
      totalBookings,
      totalRevenueData,
      todayBookings,
      pendingApprovals,
      venuesWithCourts
    ] = await Promise.all([
      prisma.venue.count(),
      prisma.user.count({ where: { role: 'VENUE_OWNER' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { paymentStatus: 'PAID' }
      }),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          }
        }
      }),
      prisma.venue.count({ where: { isActive: false } }),
      prisma.venue.findMany({
        include: {
          courts: {
            select: {
              _count: {
                select: { bookings: true }
              }
            }
          }
        }
      })
    ])

    // Calculate booking counts per venue manually since Venue -> Booking is via Court
    const topVenues = venuesWithCourts.map(venue => ({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      bookingsCount: venue.courts.reduce((acc, court) => acc + (court._count?.bookings || 0), 0)
    }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5)

    const totalRevenue = totalRevenueData._sum.totalPrice || 0
    const platformCommission = totalRevenue * 0.1

    // Prepare Chart Data
    const bookingTrend = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [12, 19, 3, 5, 2, 3, 9] // Placeholder
    }

    const revenueDist = {
      labels: topVenues.map(v => v.name),
      values: topVenues.map(v => v.bookingsCount * 100)
    }

    return NextResponse.json({
      metrics: {
        totalVenues,
        activeVenueOwners,
        totalBookings,
        totalRevenue,
        todayBookings,
        pendingApprovals,
        platformCommission,
      },
      topVenues,
      charts: {
        bookingTrend,
        revenueDist,
      }
    })
  } catch (error) {
    console.error("Dashboard Stats API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}
