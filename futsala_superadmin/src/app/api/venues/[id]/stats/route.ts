import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Fetch bookings for this venue via its courts
    const bookings = await prisma.booking.findMany({
      where: {
        court: {
          venueId: id
        }
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        court: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    })

    // Calculate earnings summary
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.totalPrice, 0)
    
    const commission = totalRevenue * 0.1 // 10% Platform commission

    return NextResponse.json({
      bookings,
      summary: {
        totalBookings: bookings.length,
        totalRevenue,
        commission,
        netOwnerEarnings: totalRevenue - commission
      }
    })
  } catch (error) {
    console.error("Fetch Venue Stats Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch venue statistics" },
      { status: 500 }
    )
  }
}
