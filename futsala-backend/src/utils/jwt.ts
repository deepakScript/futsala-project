import jwt from 'jsonwebtoken';
import env from '../config/env.config';
import prisma from '../config/prismaClient';
import { redis } from '../config/redis';

const JWT_SECRET = env.JWT_SECRET;
const JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET || JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || JWT_SECRET;

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;       // 15 minutes in seconds
export const ACCESS_TOKEN_EXPIRY_MS  = 15 * 60 * 1000; // 15 minutes in ms
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ------------------------------------------------------------------
// Token Payload Interfaces
// ------------------------------------------------------------------

export interface AdminTokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface SuperAdminTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: string;
  type?: string;
}

// ------------------------------------------------------------------
// Redis key helpers
// ------------------------------------------------------------------

/** Stores ONE active access token per user (keyed by userId). */
const accessTokenKey = (userId: string) => `access_token:${userId}`;

// ------------------------------------------------------------------
// Token Generation
// ------------------------------------------------------------------

export const signAccessToken = (payload: Record<string, unknown>): string =>
  jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

export const signRefreshToken = (payload: Record<string, unknown>): string =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

/** Generate a 15-min access token AND persist it in Redis keyed by userId. */
export const signAndStoreAccessToken = async (
  payload: Record<string, unknown>,
  userId: string
): Promise<string> => {
  const token = signAccessToken(payload);
  await redis.set(accessTokenKey(userId), token, 'EX', ACCESS_TOKEN_TTL_SECONDS);
  return token;
};

// Legacy aliases – kept for backward compatibility with the admin/superadmin helpers
export const signAdminToken = (payload: AdminTokenPayload): string =>
  signAccessToken(payload as unknown as Record<string, unknown>);

export const signSuperAdminToken = (payload: SuperAdminTokenPayload): string =>
  signAccessToken(payload as unknown as Record<string, unknown>);

// ------------------------------------------------------------------
// Token Verification
// ------------------------------------------------------------------

export const verifyAccessToken = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as T;
  } catch {
    try {
      return jwt.verify(token, JWT_SECRET) as T; // backward compat
    } catch {
      return null;
    }
  }
};

export const verifyRefreshToken = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as T;
  } catch {
    try {
      return jwt.verify(token, JWT_SECRET) as T;
    } catch {
      return null;
    }
  }
};

/** Legacy alias */
export const verifyToken = <T>(token: string): T | null =>
  verifyAccessToken<T>(token);

// ------------------------------------------------------------------
// Redis Access Token Store
// Validates JWT signature AND checks the Redis whitelist.
// ------------------------------------------------------------------

/**
 * Full server-side validation:
 *  1. Verify JWT signature + expiry.
 *  2. Look up Redis `access_token:{userId}` – token must match exactly.
 * Returns the decoded payload or null on any failure.
 */
export const validateAccessToken = async <T extends { userId?: string; id?: string }>(
  token: string
): Promise<T | null> => {
  const decoded = verifyAccessToken<T>(token);
  if (!decoded) return null;

  const userId = decoded.userId || (decoded as any).id;
  if (!userId) return null;

  const stored = await redis.get(accessTokenKey(userId));
  if (!stored || stored !== token) return null;

  return decoded;
};

/** Delete a user's active access token from Redis (revoke it immediately). */
export const revokeAccessToken = async (userId: string): Promise<void> => {
  await redis.del(accessTokenKey(userId));
};

// ------------------------------------------------------------------
// Database Refresh Token Store
// ------------------------------------------------------------------

export const storeRefreshToken = async (
  userId: string,
  token: string,
  expiresInDays = 7
): Promise<void> => {
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  await (prisma as any).refreshToken.create({ data: { token, userId, expiresAt } });
};

export const findRefreshToken = async (token: string): Promise<any> => {
  return (prisma as any).refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          isVerified: true,
          tenantId: true,
          createdAt: true,
        },
      },
    },
  });
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  try {
    await (prisma as any).refreshToken.delete({ where: { token } });
  } catch {
    // Ignore – already deleted
  }
};

export const deleteUserRefreshTokens = async (userId: string): Promise<void> => {
  try {
    await (prisma as any).refreshToken.deleteMany({ where: { userId } });
  } catch {
    // Ignore
  }
};

// ------------------------------------------------------------------
// Cookie Options
// ------------------------------------------------------------------

export const cookieOptions = {
  httpOnly: true,
  path: '/',
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'lax' | 'none' | 'strict',
};

export const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: ACCESS_TOKEN_EXPIRY_MS,
};

export const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
};
