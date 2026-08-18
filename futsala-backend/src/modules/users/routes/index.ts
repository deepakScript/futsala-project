import { Router } from 'express';
import authRoutes from './auth.routes';
import bookingRoutes from './booking.routes';
import futsalRoutes from './futsal.routes';
import userRoutes from './user.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/futsal', futsalRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);

export default router;
