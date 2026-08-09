import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminAuthService } from '../services/auth.service';
import { cookieOptions } from '../../../utils/jwt';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminAuthService.login(req.body);
  res.cookie('token', result.token, { ...result.cookieOptions, maxAge: 60 * 60 * 24 * 1000 });
  res.json({ message: 'Login successful', user: result.user });
});

export const logout = (_req: Request, res: Response) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
};
