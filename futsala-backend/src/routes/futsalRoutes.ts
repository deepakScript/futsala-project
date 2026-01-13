import{ Router } from "express";
import { getAllVenues, getVenueById, searchVenues } from "../controllers/futsalController";


const router = Router();

router.get("/venue", getAllVenues);
router.get("/venue-search", searchVenues);
router.get("/venue/:id", getVenueById);

export default router;
