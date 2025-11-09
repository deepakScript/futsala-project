import express from "express";
import { getAllVenues, getVenueById, searchVenues } from "../controllers/futsalController";


const router = express.Router();

router.get("/", getAllVenues);
router.get("/:id", getVenueById);
router.get("/search-venue", searchVenues)

export default router;