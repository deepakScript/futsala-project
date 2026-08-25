import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminAuthService } from '../services/auth.service';
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../../../utils/jwt';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await superAdminAuthService.login(req.body);

  res.cookie('auth-token', result.token, accessTokenCookieOptions);
  res.cookie('token', result.token, accessTokenCookieOptions);
  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);

  res.json({
    success: true,
    user: result.user,
    token: result.token,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await superAdminAuthService.refreshAccessToken(token);

  res.cookie('auth-token', result.token, accessTokenCookieOptions);
  res.cookie('token', result.token, accessTokenCookieOptions);
  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);

  res.json({
    success: true,
    user: result.user,
    token: result.token,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const userId = (req as any).platformAdmin?.userId || (req as any).platformAdmin?.id;
  await superAdminAuthService.logout(userId, token);

  res.cookie('auth-token', '', { ...accessTokenCookieOptions, maxAge: 0 });
  res.cookie('token', '', { ...accessTokenCookieOptions, maxAge: 0 });
  res.cookie('refreshToken', '', { ...refreshTokenCookieOptions, maxAge: 0 });

  res.json({ success: true, message: 'Logged out successfully' });
});
