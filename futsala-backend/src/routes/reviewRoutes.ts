import express from "express";
import { createReview, getVenueReviews, deleteReview } from "../controllers/reviewController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.post("/create/:futsalId", verifyToken, createReview);
router.get("/futsal/:futsalId", getVenueReviews);
router.delete("/delete/:reviewId", verifyToken, deleteReview);

export default router;
