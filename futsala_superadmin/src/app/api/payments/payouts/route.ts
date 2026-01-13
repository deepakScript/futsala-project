import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/payments/payouts - Aggregated earnings per venue
export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        courts: {
          include: {
            bookings: {
              where: {
                paymentStatus: 'PAID',
                status: 'COMPLETED' // Only completed bookings for payouts? 
                // Or any PAID booking. Usually completed is safer.
              },
              include: {
                payment: true
              }
            }
          }
        },
        owner: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    })

    const payoutData = venues.map(venue => {
      let grossRevenue = 0
      venue.courts.forEach(court => {
        court.bookings.forEach(booking => {
          grossRevenue += booking.totalPrice
        })
      })

      const commission = grossRevenue * 0.1
      const netPayout = grossRevenue - commission

      return {
        venueId: venue.id,
        venueName: venue.name,
        ownerName: venue.owner.fullName,
        ownerEmail: venue.owner.email,
        grossRevenue,
        commission,
        netPayout
      }
    })

    return NextResponse.json({ payouts: payoutData })
  } catch (error) {
    console.error("Payouts Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payout data" },
      { status: 500 }
    )
  }
}
