import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/venues - List all venues
export async function GET(request: NextRequest) {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        _count: {
          select: {
            courts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ venues })
  } catch (error) {
    console.error("Fetch Venues Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    )
  }
}

// POST /api/venues - Create a new venue
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, description, address, city, phoneNumber, ownerId, amenities, images } = data

    if (!name || !address || !city || !ownerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify that the owner has the correct role
    const owner = await prisma.user.findFirst({
      where: {
        id: ownerId,
        role: 'VENUE_OWNER'
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: "Invalid owner: User must be a verified venue owner" },
        { status: 400 }
      )
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        description: description || "",
        address,
        city,
        phoneNumber,
        ownerId,
        amenities: amenities || [],
        images: images || [],
        isActive: true // Default to active for newly created venues by admin
      }
    })

    return NextResponse.json({ venue }, { status: 201 })
  } catch (error) {
    console.error("Create Venue Error:", error)
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    )
  }
}
