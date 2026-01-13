import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/owners - List all venue owners
export async function GET() {
  try {
    const owners = await prisma.user.findMany({
      where: {
        role: 'VENUE_OWNER'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            venues: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ owners })
  } catch (error) {
    console.error("Fetch Owners Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch owners" },
      { status: 500 }
    )
  }
}
