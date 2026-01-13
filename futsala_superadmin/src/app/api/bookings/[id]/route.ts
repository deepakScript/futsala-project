import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// PATCH /api/bookings/[id] - Update booking status / refund
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, paymentStatus, notes } = await request.json()

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (notes !== undefined) updateData.notes = notes

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        court: {
          include: { venue: true }
        },
        payment: true
      }
    })

    // If payment status is being set to REFUNDED, update the Payment record too
    if (paymentStatus === 'REFUNDED' && booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: 'REFUNDED' }
      })
    }

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error("Update Booking Error:", error)
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // We might want to check if it's allowed to delete (e.g. only cancelled bookings)
    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Delete Booking Error:", error)
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    )
  }
}
