import express from "express";
import { getProfile,deleteAccount,updateProfile, } from "../controllers/userController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.put("/update", verifyToken, updateProfile);
router.delete("/delete", verifyToken, deleteAccount);


export default router;
