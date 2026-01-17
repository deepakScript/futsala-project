import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/payments/stats - Platform revenue and commission stats
export async function GET() {
  try {
    const [
      totalPaid,
      totalRefunded,
      allPayments
    ] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'REFUNDED' }
      }),
      prisma.payment.findMany({
        where: { status: 'PAID' }
      })
    ])

    const totalRevenue = totalPaid._sum.amount || 0
    const totalRefundedAmt = totalRefunded._sum.amount || 0
    
    // Commission is 2%
    const totalCommission = totalRevenue * 0.02
    const netPlatformRevenue = totalCommission - (totalRefundedAmt * 0.02) // 2% of refunds lost? or full? 
    // Usually commission is only on successful non-refunded bookings.
    
    return NextResponse.json({
      totalRevenue,
      totalCommission,
      totalRefunded: totalRefundedAmt,
      netPlatformRevenue
    })
  } catch (error) {
    console.error("Payment Stats Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    )
  }
}
