import { Router } from 'express';
import { requireSuperAdmin } from '../middlewares/auth.middleware';
import * as auth from '../controllers/auth.controller';
import * as admins from '../controllers/admins.controller';
import * as bookings from '../controllers/bookings.controller';
import * as dashboard from '../controllers/dashboard.controller';
import * as owners from '../controllers/owners.controller';
import * as venues from '../controllers/venues.controller';
import * as payments from '../controllers/payments.controller';
import * as users from '../controllers/users.controller';
import * as reports from '../controllers/reports.controller';

const router = Router();

router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/refresh-token', auth.refresh);

router.use(requireSuperAdmin);

router.get('/admins', admins.listAdmins);
router.post('/admins', admins.createAdmin);
router.patch('/admins/:id', admins.updateAdmin);
router.delete('/admins/:id', admins.deleteAdmin);

router.get('/bookings', bookings.listBookings);
router.patch('/bookings/:id', bookings.patchBooking);
router.delete('/bookings/:id', bookings.deleteBooking);

router.get('/dashboard/stats', dashboard.getStats);

router.get('/owners', owners.listOwners);
router.post('/owners', owners.createOwner);
router.get('/owners/:id/performance', owners.getOwnerPerformance);
router.get('/owners/:id', owners.getOwner);
router.patch('/owners/:id', owners.patchOwner);
router.delete('/owners/:id', owners.deleteOwner);

router.get('/payments', payments.listPayments);
router.get('/payments/stats', payments.getPaymentStats);
router.get('/payments/payouts', payments.getPayouts);

router.get('/reports', reports.getReports);

router.get('/users', users.listCustomers);
router.get('/users/owners', users.listOwnersSimple);
router.patch('/users/:id/status', users.patchUserStatus);
router.get('/users/:id/bookings', users.getUserBookings);

router.get('/venues', venues.listVenues);
router.post('/venues', venues.createVenue);
router.get('/venues/:id/stats', venues.getVenueStats);
router.get('/venues/:id', venues.getVenue);
router.patch('/venues/:id', venues.patchVenue);
router.delete('/venues/:id', venues.deleteVenue);

export default router;
