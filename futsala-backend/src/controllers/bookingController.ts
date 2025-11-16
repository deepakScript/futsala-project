// Booking Controller
import { Request, Response } from 'express';
import prisma from '../config/prismaClient';


// BookingStatus enum (should match your Prisma schema)
enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

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
    const { futsalId } = req.params;
    const { date } = req.query as { date?: string };

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Parse the date and get day of week
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0-6 (Sunday-Saturday)

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
              gte: new Date(date),
              lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            },
            status: {
              notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED]
            }
          }
        }
      }
    });

    // Process availability for each court
    const availability = courts.map(court => {
      const bookedSlots = court.bookings.map(b => ({
        startTime: b.startTime,
        endTime: b.endTime
      }));

      const availableSlots = court.timeSlots.filter(slot => {
        // Check if slot overlaps with any booking
        const isBooked = bookedSlots.some(booked => {
          return !(slot.endTime <= booked.startTime || slot.startTime >= booked.endTime);
        });
        return !isBooked;
      });

      return {
        courtId: court.id,
        courtName: court.name,
        courtType: court.courtType,
        pricePerHour: court.pricePerHour,
        availableSlots: availableSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      };
    });

    return res.status(200).json({
      success: true,
      date: date,
      dayOfWeek: dayOfWeek,
      data: availability
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
export const createBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

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

    // Get court details
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { venue: true }
    });

    if (!court || !court.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Court not found or inactive'
      });
    }

    // Calculate total hours and price
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const totalHours = (end - start) / 60; // Convert minutes to hours

    if (totalHours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time range'
      });
    }

    const totalPrice = totalHours * court.pricePerHour;

    // Check if slot is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId: courtId,
        bookingDate: new Date(bookingDate),
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED]
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
      return res.status(409).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        courtId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        totalHours,
        totalPrice,
        notes,
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

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all bookings of logged-in user
 * @route GET /my
 */
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

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
export const getBookingById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

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
    if (booking.userId !== userId && booking.court.venue.ownerId !== userId) {
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
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

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
export const rescheduleBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
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
          notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED]
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