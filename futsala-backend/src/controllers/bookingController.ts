// Booking Controller
import { Request, Response } from 'express';
import { BookingStatus } from '@prisma/client';
import prisma from '../config/prismaClient';
import crypto from 'crypto';


// BookingStatus enum imported from prisma client


// Note: Request type is already extended globally in verifyToken.ts middleware
// The user property has type DecodedUser with userId field

// Interface for create booking request body
interface CreateBookingBody {
  courtId: string;
  bookingDate: string; // ISO date string
  startTime: string;   // "08:00"
  endTime: string;     // "10:00"
  notes?: string;
}

// Interface for reschedule booking request body
interface RescheduleBookingBody {
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Check available time slots for a futsal
 * @route GET /availability/:futsalId?date=
 */
export const checkAvailability = async (req: Request, res: Response): Promise<Response> => {
  try {
    const futsalId = (req.params.futsalId || req.query.futsalId) as string;
    const { date } = req.query as { date?: string };
    
    if (!futsalId) {
      return res.status(400).json({
        success: false,
        message: 'Futsal ID is required (either as path parameter or query parameter)'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Parse the date robustly
    // Use a simple split and Date.UTC to avoid timezone-related day shifts
    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day));
    
    if (isNaN(bookingDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD'
        });
    }
    
    // Day of week from UTC to match our simple date string
    const dayOfWeek = bookingDate.getUTCDay(); // 0-6 (Sunday-Saturday)
    
    console.log(`[checkAvailability] Checking for date: ${date}, dayOfWeek: ${dayOfWeek}`);

    // Create start and end of day dates for the query
    const startOfDay = new Date(bookingDate);
    const endOfDay = new Date(bookingDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // Get all courts for this venue
    const courts = await prisma.court.findMany({
      where: {
        venueId: futsalId,
        isActive: true
      },
      include: {
        timeSlots: {
          where: {
            dayOfWeek: dayOfWeek,
            isAvailable: true
          },
          orderBy: {
            startTime: 'asc'
          }
        },
        bookings: {
          where: {
            bookingDate: {
              gte: startOfDay,
              lt: endOfDay
            },
            status: {
              notIn: [BookingStatus.CANCELLED]
            }
          }
        }
      }
    });

    console.log(`[checkAvailability] Found ${courts.length} courts for venue ${futsalId}`);
    courts.forEach((c: any) => {
      console.log(`  Court: ${c.name}, Slots: ${c.timeSlots.length}, Bookings: ${c.bookings.length}`);
    });

    // Process availability for each court into a flattened list of slots
    const flattenedAvailability: any[] = [];
    
    courts.forEach((court: any) => {
      const bookedSlots = court.bookings.map(b => ({
        startTime: b.startTime,
        endTime: b.endTime
      }));

      court.timeSlots.forEach(slot => {
        // Check if slot overlaps with any booking
        const isBooked = bookedSlots.some(booked => {
          return !(slot.endTime <= booked.startTime || slot.startTime >= booked.endTime);
        });

        flattenedAvailability.push({
          courtId: court.id,
          courtName: court.name,
          courtType: court.courtType,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: court.pricePerHour, // Match frontend expected field 'price'
          isAvailable: !isBooked
        });
      });
    });

    return res.status(200).json({
      success: true,
      date: date,
      dayOfWeek: dayOfWeek,
      data: flattenedAvailability
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new booking
 * @route POST /create
 */
export const createBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { courtId, bookingDate, startTime, endTime, notes } = req.body as CreateBookingBody;

    // Validate required fields
    if (!courtId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: courtId, bookingDate, startTime, endTime'
      });
    }

    const bookingDateObj = new Date(bookingDate);
     if (isNaN(bookingDateObj.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format'
        });
    }

    // Use a transaction to prevent race conditions
    const booking = await prisma.$transaction(async (tx) => {
        // Validate user exists
        const user = await tx.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          throw new Error('User not found. Please ensure you are using a valid user ID.');
        }

        // Get court details
        const court = await tx.court.findUnique({

          where: { id: courtId },
          include: { venue: true }
        });

        if (!court || !court.isActive) {
          throw new Error('Court not found or inactive');
        }

        // Calculate total hours and price
        const start = parseTime(startTime);
        const end = parseTime(endTime);
        const totalHours = (end - start) / 60; // Convert minutes to hours

        if (totalHours <= 0) {
          throw new Error('Invalid time range');
        }

        const totalPrice = totalHours * court.pricePerHour;

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Check if slot is already booked (LOCKING/CHECKING within transaction)
        const existingBooking = await tx.booking.findFirst({
          where: {
            courtId: courtId,
            bookingDate: bookingDateObj,
            status: {
              notIn: [BookingStatus.CANCELLED]
            },
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } }
                ]
              }
            ]
          }
        });

        if (existingBooking) {
          throw new Error('Time slot is already booked');
        }

        // Create booking with OTP
        return await tx.booking.create({
          data: {
            userId,
            courtId,
            bookingDate: bookingDateObj,
            startTime,
            endTime,
            totalHours,
            totalPrice,
            notes,
            otp,
            status: BookingStatus.PENDING
          },
          include: {
            court: {
              include: {
                venue: true
              }
            }
          }
        });
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific errors from the transaction
    if (errorMessage.includes('User not found')) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found. Please ensure you are logged in with a valid account.' 
        });
    }
    if (errorMessage === 'Court not found or inactive') {
        return res.status(404).json({ success: false, message: errorMessage });
    }
    if (errorMessage === 'Invalid time range') {
        return res.status(400).json({ success: false, message: errorMessage });
    }
    if (errorMessage === 'Time slot is already booked') {
        return res.status(409).json({ success: false, message: errorMessage });
    }
    
    // Handle Prisma foreign key constraint errors
    if (errorMessage.includes('Foreign key constraint')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid reference: User or Court does not exist in the database.',
          error: errorMessage 
        });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: errorMessage
    });
  }
};

/**
 * Get all bookings of logged-in user
 * @route GET /my
 */
export const getMyBookings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        court: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                phoneNumber: true,
                images: true
              }
            }
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get booking details
 * @route GET /:id
 */
export const getBookingById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: {
          include: {
            venue: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        payment: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is the venue owner
    if (booking.userId !== userId && (booking as any).court.venue.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Cancel a booking
 * @route PUT /cancel/:id
 */
export const cancelBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED
      },
      include: {
        court: {
          include: {
            venue: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Reschedule a booking
 * @route PUT /reschedule/:id
 */
export const rescheduleBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { bookingDate, startTime, endTime } = req.body as RescheduleBookingBody;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reschedule your own bookings'
      });
    }

    // Check if booking can be rescheduled
    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule cancelled or completed booking'
      });
    }

    // Prepare update data
    const updateData: any = {};
    let recalculatePrice = false;

    if (bookingDate) {
      updateData.bookingDate = new Date(bookingDate);
    }

    if (startTime) {
      updateData.startTime = startTime;
      recalculatePrice = true;
    }

    if (endTime) {
      updateData.endTime = endTime;
      recalculatePrice = true;
    }

    // Recalculate total hours and price if time changed
    if (recalculatePrice) {
      const newStartTime = startTime || booking.startTime;
      const newEndTime = endTime || booking.endTime;
      
      const start = parseTime(newStartTime);
      const end = parseTime(newEndTime);
      const totalHours = (end - start) / 60;

      if (totalHours <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time range'
        });
      }

      updateData.totalHours = totalHours;
      updateData.totalPrice = totalHours * booking.court.pricePerHour;
    }

    // Check for conflicts with new time slot
    const newBookingDate = bookingDate ? new Date(bookingDate) : booking.bookingDate;
    const newStartTime = startTime || booking.startTime;
    const newEndTime = endTime || booking.endTime;

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        id: { not: id }, // Exclude current booking
        courtId: booking.courtId,
        bookingDate: newBookingDate,
        status: {
          notIn: [BookingStatus.CANCELLED]
        },
        OR: [
          {
            AND: [
              { startTime: { lte: newStartTime } },
              { endTime: { gt: newStartTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: newEndTime } },
              { endTime: { gte: newEndTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: newStartTime } },
              { endTime: { lte: newEndTime } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'New time slot is already booked'
      });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        court: {
          include: {
            venue: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: updatedBooking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to parse time string to minutes
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}