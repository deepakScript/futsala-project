import { Router } from 'express';
import multer from 'multer';
import { requireAdminUser, requireVenueOwner } from '../middlewares/auth.middleware';
import * as auth from '../controllers/auth.controller';
import * as bookings from '../controllers/bookings.controller';
import * as dashboard from '../controllers/dashboard.controller';
import * as venues from '../controllers/venues.controller';
import * as profile from '../controllers/profile.controller';
import * as timeSlots from '../controllers/timeSlots.controller';
import * as earnings from '../controllers/earnings.controller';
import * as upload from '../controllers/upload.controller';
import * as customers from '../controllers/customers.controller';

const router = Router();
const uploadMiddleware = multer({ storage: multer.memoryStorage() });

router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/refresh-token', auth.refresh);

router.get('/bookings', requireVenueOwner, bookings.getBookings);
router.patch('/bookings', requireVenueOwner, bookings.patchBooking);

router.get('/customers', requireVenueOwner, customers.getCustomers);

router.get('/dashboard/stats', requireVenueOwner, dashboard.getStats);
router.get('/earnings', requireVenueOwner, earnings.getEarnings);

router.get('/profile', requireAdminUser, profile.getProfile);
router.patch('/profile', requireAdminUser, profile.patchProfile);
router.put('/profile', requireAdminUser, profile.updatePassword);

router.get('/time-slots', requireVenueOwner, timeSlots.getTimeSlots);
router.post('/time-slots', requireVenueOwner, timeSlots.updateTimeSlots);

router.get('/venues', requireVenueOwner, venues.getVenue);
router.patch('/venues', requireVenueOwner, venues.patchVenue);

router.post('/upload', requireVenueOwner, uploadMiddleware.single('file'), upload.uploadVenueImage);

export default router;
