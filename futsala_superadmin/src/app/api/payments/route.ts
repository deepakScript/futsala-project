import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/payments - List all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const method = searchParams.get('method')

    const where: any = {}
    if (status) where.status = status
    if (method) where.paymentMethod = method

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            },
            court: {
              include: {
                venue: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Fetch Payments Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}
