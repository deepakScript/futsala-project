import { Router } from 'express';
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
} from '../controllers/booking.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.get('/availability', checkAvailability);
router.post('/create', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.get('/booking/:id', verifyToken, getBookingById);
router.put('/cancel/:id', verifyToken, cancelBooking);
router.put('/reschedule/:id', verifyToken, rescheduleBooking);

export default router;
