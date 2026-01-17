import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/venues/[id] - Get venue details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        owner: true,
        courts: true,
        reviews: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    return NextResponse.json({ venue })
  } catch (error) {
    console.error("Fetch Venue Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch venue details" },
      { status: 500 }
    )
  }
}

// PATCH /api/venues/[id] - Update venue or toggle status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const { courts, ...venueData } = data

    // Update Venue
    const venue = await prisma.venue.update({
      where: { id },
      data: venueData
    })

    // Update/Create Courts
    if (courts && Array.isArray(courts)) {
      for (const court of courts) {
        if (court.id) {
          await prisma.court.update({
            where: { id: court.id },
            data: {
              name: court.name,
              pricePerHour: parseFloat(court.pricePerHour.toString()),
            }
          })
        } else {
          await prisma.court.create({
            data: {
              name: court.name,
              pricePerHour: parseFloat(court.pricePerHour.toString()),
              courtType: "Standard",
              surfaceType: "Turf",
              venueId: id
            }
          })
        }
      }
    }

    return NextResponse.json({ venue })
  } catch (error) {
    console.error("Update Venue Error:", error)
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    )
  }
}

// DELETE /api/venues/[id] - Delete venue
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.venue.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete Venue Error:", error)
    return NextResponse.json(
      { error: "Failed to delete venue" },
      { status: 500 }
    )
  }
}
