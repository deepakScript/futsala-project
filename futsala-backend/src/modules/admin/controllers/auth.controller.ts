import { Request, Response, CookieOptions } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminAuthService } from '../services/auth.service';
import env from '../../../config/env.config';
import { REFRESH_TOKEN_EXPIRY_MS } from '../../../utils/jwt';
import { AppError, ErrorCode } from '../../../utils/customError';

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
  path: '/',
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminAuthService.login(req.body);

  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);

  res.json({
    message: 'Login successful',
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await adminAuthService.refreshAccessToken(token);

  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);

  res.json({
    message: 'Token refreshed successfully',
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // 1. Read the refresh token from cookie
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new AppError('No refresh token cookie found', 400, ErrorCode.BAD_REQUEST);
  }

  const userId = (req as any).venueOwner?.id || (req as any).venueOwner?.userId;

  // 2. Revoke/delete the corresponding session or refresh token
  await adminAuthService.logout(refreshToken, userId);

  // 3. Clear the refresh-token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

