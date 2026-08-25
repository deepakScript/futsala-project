import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminAuthService } from '../services/auth.service';
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../../../utils/jwt';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminAuthService.login(req.body);

  res.cookie('token', result.token, accessTokenCookieOptions);
  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);

  res.json({
    message: 'Login successful',
    user: result.user,
    token: result.token,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await adminAuthService.refreshAccessToken(token);

  res.cookie('token', result.token, accessTokenCookieOptions);
  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);

  res.json({
    message: 'Token refreshed successfully',
    user: result.user,
    token: result.token,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenVal = req.cookies?.refreshToken || req.body?.refreshToken;
  const userId = (req as any).venueOwner?.id || (req as any).venueOwner?.userId;
  await adminAuthService.logout(userId, refreshTokenVal);

  res.cookie('token', '', { ...accessTokenCookieOptions, maxAge: 0 });
  res.cookie('refreshToken', '', { ...refreshTokenCookieOptions, maxAge: 0 });

  res.json({ success: true, message: 'Logged out successfully' });
});
