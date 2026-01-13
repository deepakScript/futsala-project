import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/users/owners - List all venue owners
export async function GET(request: NextRequest) {
  try {
    const owners = await prisma.user.findMany({
      where: {
        role: 'VENUE_OWNER',
        isVerified: true
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    })

    return NextResponse.json({ owners })
  } catch (error) {
    console.error("Fetch Owners Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch venue owners" },
      { status: 500 }
    )
  }
}
