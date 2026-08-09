import { Router } from 'express';
import { createReview, getVenueReviews, deleteReview } from '../controllers/reviewController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post('/create/:futsalId', verifyToken, createReview);
router.get('/futsal/:futsalId', getVenueReviews);
router.delete('/delete/:reviewId', verifyToken, deleteReview);

export default router;
