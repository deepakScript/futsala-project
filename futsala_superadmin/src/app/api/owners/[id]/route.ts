import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET /api/owners/[id] - Get owner details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const owner = await prisma.user.findFirst({
      where: { 
        id,
        role: 'VENUE_OWNER'
      },
      include: {
        venues: {
          include: {
            _count: {
              select: {
                courts: true
              }
            },
            courts: {
              include: {
                _count: {
                  select: {
                    bookings: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!owner || owner.role !== 'VENUE_OWNER') {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 })
    }

    // Exclude password
    const { password, ...ownerData } = owner
    return NextResponse.json({ owner: ownerData })
  } catch (error) {
    console.error("Fetch Owner Detail Error:", error)
    return NextResponse.json({ error: "Failed to fetch owner details" }, { status: 500 })
  }
}

// PATCH /api/owners/[id] - Update owner (activation, verification, password)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { newPassword, ...updateData } = body

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }

    const updatedOwner = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        isVerified: true
      }
    })

    return NextResponse.json({ owner: updatedOwner })
  } catch (error) {
    console.error("Update Owner Error:", error)
    return NextResponse.json({ error: "Failed to update owner" }, { status: 500 })
  }
}

// DELETE /api/owners/[id] - Delete owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if owner has venues
    const venueCount = await prisma.venue.count({
      where: { ownerId: id }
    })

    if (venueCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete owner with active venues. Delete venues first." }, 
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete Owner Error:", error)
    return NextResponse.json({ error: "Failed to delete owner" }, { status: 500 })
  }
}
