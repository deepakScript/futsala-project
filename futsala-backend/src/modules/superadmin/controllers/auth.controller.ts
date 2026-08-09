import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminAuthService } from '../services/auth.service';
import { cookieOptions } from '../../../utils/jwt';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await superAdminAuthService.login(req.body);
  res.cookie('auth-token', result.token, { ...result.cookieOptions, maxAge: 60 * 60 * 24 * 7 * 1000 });
  res.json({ success: true, user: result.user });
});

export const logout = (_req: Request, res: Response) => {
  res.cookie('auth-token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};
