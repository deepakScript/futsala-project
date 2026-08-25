import { superAdminAuthRepository } from '../repositories/auth.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import {
  signAndStoreAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  revokeAccessToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  cookieOptions,
} from '../../../utils/jwt';

export class SuperAdminAuthService {
  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400, ErrorCode.BAD_REQUEST);
    }

    const user = await superAdminAuthRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPERADMIN') {
      throw new AppError('Access denied. Admin privileges required.', 403, ErrorCode.FORBIDDEN);
    }

    const isValid = await superAdminAuthRepository.comparePassword(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    // Sign access token & store in Redis whitelist (15 min TTL)
    const accessToken = await signAndStoreAccessToken(
      { userId: user.id, email: user.email, role: user.role },
      user.id
    );
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

    // Persist refresh token in database
    await storeRefreshToken(user.id, refreshToken);

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      cookieOptions,
      accessTokenCookieOptions,
      refreshTokenCookieOptions,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  async refreshAccessToken(token: string) {
    if (!token) {
      throw new AppError('Refresh token is required', 400, ErrorCode.BAD_REQUEST);
    }

    const decoded = verifyRefreshToken<{ userId: string; email: string; role: string }>(token);
    if (!decoded || !decoded.userId) {
      throw new AppError('Invalid or expired refresh token', 401, ErrorCode.UNAUTHORIZED);
    }

    // Validate token in database
    const storedToken = await findRefreshToken(token);
    if (!storedToken || new Date() > new Date(storedToken.expiresAt)) {
      if (storedToken) {
        await deleteRefreshToken(token);
      }
      throw new AppError('Invalid or expired refresh token', 401, ErrorCode.UNAUTHORIZED);
    }

    const user = await superAdminAuthRepository.findByEmail(decoded.email);
    if (!user || (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPERADMIN')) {
      throw new AppError('Access denied', 403, ErrorCode.FORBIDDEN);
    }

    // Rotate: revoke old Redis access token, delete old DB refresh token
    await revokeAccessToken(user.id);
    await deleteRefreshToken(token);

    const newAccessToken = await signAndStoreAccessToken(
      { userId: user.id, email: user.email, role: user.role },
      user.id
    );
    const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await storeRefreshToken(user.id, newRefreshToken);

    return {
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  async logout(userId?: string, token?: string): Promise<void> {
    if (userId) await revokeAccessToken(userId);
    if (token) await deleteRefreshToken(token);
  }
}

export const superAdminAuthService = new SuperAdminAuthService();
