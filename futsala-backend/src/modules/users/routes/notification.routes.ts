import { Router } from "express";
import {
  getAllNotifications,
  markAsRead,
} from "../controllers/notificationController";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", verifyToken, getAllNotifications);
router.put("/read/:id", verifyToken, markAsRead);

export default router;
