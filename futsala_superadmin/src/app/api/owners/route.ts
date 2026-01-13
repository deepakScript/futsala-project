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
// POST /api/owners - Create a new venue owner
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { fullName, email, phoneNumber, password } = data

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    // Hash password
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const owner = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber: phoneNumber || "",
        password: hashedPassword,
        role: 'VENUE_OWNER'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({ owner }, { status: 201 })
  } catch (error) {
    console.error("Create Owner Error:", error)
    return NextResponse.json(
      { error: "Failed to create venue owner" },
      { status: 500 }
    )
  }
}
