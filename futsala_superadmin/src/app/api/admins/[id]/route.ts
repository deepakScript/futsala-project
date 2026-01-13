import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

// PATCH /api/admins/[id] - Update admin
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const { fullName, phoneNumber, password } = data

    const updateData: any = {}
    if (fullName !== undefined) updateData.fullName = fullName
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const admin = await prisma.user.update({
      where: { 
        id,
        role: 'ADMIN' // Security: Ensure we only update admin with this route
      },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true
      }
    })

    return NextResponse.json({ admin })
  } catch (error) {
    console.error("Update Admin Error:", error)
    return NextResponse.json(
      { error: "Failed to update admin" },
      { status: 500 }
    )
  }
}

// DELETE /api/admins/[id] - Delete admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Prevent deleting the very last admin? 
    // Usually super admins shouldn't delete themselves easily.

    await prisma.user.delete({
      where: { 
        id,
        role: 'ADMIN' 
      }
    })

    return NextResponse.json({ message: "Admin deleted successfully" })
  } catch (error) {
    console.error("Delete Admin Error:", error)
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    )
  }
}
