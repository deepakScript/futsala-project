import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  otpVerification,
  savePassword,
  refreshAccessToken,
  getAllUsers,
} from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/otp-verification', otpVerification);
router.post('/save-password', savePassword);
router.post('/refresh-token', refreshAccessToken);
router.post('/refresh', refreshAccessToken);
router.get('/users', verifyToken, getAllUsers);

export default router;
