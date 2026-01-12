import express from "express";
import { initiatePayment, verifyPayment, getPaymentHistory } from "../controllers/paymentController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.post("/initiate", verifyToken, initiatePayment);
router.post("/verify", verifyToken, verifyPayment);
router.get("/history", verifyToken, getPaymentHistory);

export default router;
