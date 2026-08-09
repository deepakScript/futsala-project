import { Router } from "express";
import authRoutes from "./auth.routes";
import bookingRoutes from "./booking.routes";
import futsalRoutes from "./futsal.routes";
import userRoutes from "./user.routes";
import notificationRoutes from "./notification.routes";
import paymentRoutes from "./payment.routes";
import reviewRoutes from "./review.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/futsal", futsalRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);

export default router;
