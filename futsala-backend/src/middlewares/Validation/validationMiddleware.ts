import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Reusable validator result checker
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    return;
  }
  next();
};

// Auth Validations
export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

// Venue Validations
export const validateVenueCreate = [
  body('name').trim().notEmpty().withMessage('Venue name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('ownerId').isUUID().withMessage('Valid Owner ID is required'),
  validateRequest,
];

export const validateVenueUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Venue name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('phoneNumber').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('description').optional().trim(),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  validateRequest,
];

// Owner & Admin Account Validations
export const validateUserCreate = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('phoneNumber').optional().trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateRequest,
];

export const validateUserUpdate = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phoneNumber').optional().trim(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest,
];

export const validateUserStatus = [
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean value'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),
  validateRequest,
];

// Booking Validations
export const validateBookingCreate = [
  body('courtId').isUUID().withMessage('Valid Court ID is required'),
  body('bookingDate').isISO8601().withMessage('Valid booking date is required (ISO8601)'),
  body('startTime')
    .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('totalPrice').isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  validateRequest,
];

export const validateBookingStatus = [
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Invalid booking status'),
  body('paymentStatus')
    .optional()
    .isIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
    .withMessage('Invalid payment status'),
  validateRequest,
];

// Time Slot Validations
export const validateTimeSlotSchedule = [
  body('courtId').isUUID().withMessage('Valid Court ID is required'),
  body('daySchedules').isArray().withMessage('daySchedules must be an array'),
  body('daySchedules.*.dayOfWeek')
    .isInt({ min: 0, max: 6 })
    .withMessage('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'),
  body('daySchedules.*.openTime')
    .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('openTime must be in HH:MM format'),
  body('daySchedules.*.closeTime')
    .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('closeTime must be in HH:MM format'),
  body('daySchedules.*.blockedSlots')
    .isArray()
    .withMessage('blockedSlots must be an array of time strings'),
  validateRequest,
];
