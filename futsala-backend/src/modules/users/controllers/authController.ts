import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import env from '../../../config/env.config';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const result = await authService.register(parsed.data);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: result.user,
      token: result.accessToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const { email, password } = parsed.data;
  const result = await authService.login(email, password);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      token: result.accessToken,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const result = await authService.refreshAccessToken(token);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const { email } = parsed.data;
  await authService.requestPasswordReset(email);

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const { token, newPassword } = parsed.data;
  await authService.resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const user = await authService.getProfile(userId);

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user },
  });
});

export const registerUser = register;
export const loginUser = login;
export const refreshAccessToken = refreshToken;
export const otpVerification = resetPassword;
export const savePassword = resetPassword;
export const getAllUsers = getMe;
