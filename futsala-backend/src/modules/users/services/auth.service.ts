import bcrypt from 'bcryptjs';
import { authRepository } from '../repositories/auth.repository';
import { toUserResponseDto, UserResponseDto } from '../dtos/user.dto';
import { AppError, ErrorCode } from '../../../utils/customError';
import { redis } from '../../../config/redis';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import env from '../../../config/env.config';
import { emailQueue } from '../../../utils/email/email.queue';
import {
  signAndStoreAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  revokeAccessToken,
} from '../../../utils/jwt';

export interface AuthTokensResponse {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role?: UserRole;
    tenantId?: string;
  }): Promise<AuthTokensResponse> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existingUser = await authRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('Email is already registered', 400, ErrorCode.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await authRepository.createUser({
      ...data,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Sign access token & store in Redis (15-min whitelist)
    const accessToken = await signAndStoreAccessToken(
      { userId: user.id, email: user.email, role: user.role, type: 'access' },
      user.id
    );
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role, type: 'refresh' });

    // Persist refresh token in DB
    await storeRefreshToken(user.id, refreshToken);

    return { user: toUserResponseDto(user), accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<AuthTokensResponse> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('Invalid email or password', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    // Sign access token & store in Redis (15-min whitelist)
    const accessToken = await signAndStoreAccessToken(
      { userId: user.id, email: user.email, role: user.role, type: 'access' },
      user.id
    );
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role, type: 'refresh' });

    // Persist refresh token in DB
    await storeRefreshToken(user.id, refreshToken);

    return { user: toUserResponseDto(user), accessToken, refreshToken };
  }

  async refreshAccessToken(token: string): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    if (!token) {
      throw new AppError('Refresh token is required', 400, ErrorCode.BAD_REQUEST);
    }

    // 1. Verify JWT signature
    const decoded = verifyRefreshToken<{ userId: string; email: string; role: UserRole }>(token);
    if (!decoded?.userId) {
      throw new AppError('Invalid or expired refresh token', 401, ErrorCode.UNAUTHORIZED);
    }

    // 2. Check DB – token must exist and not be expired
    const storedToken = await findRefreshToken(token);
    if (!storedToken || new Date() > new Date(storedToken.expiresAt)) {
      if (storedToken) await deleteRefreshToken(token);
      throw new AppError('Invalid or expired refresh token', 401, ErrorCode.UNAUTHORIZED);
    }

    const user = await authRepository.findById(decoded.userId);
    if (!user) throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);

    // 3. Rotate: revoke old Redis access token, delete old DB refresh token
    await revokeAccessToken(user.id);
    await deleteRefreshToken(token);

    // 4. Issue new pair
    const newAccessToken = await signAndStoreAccessToken(
      { userId: user.id, email: user.email, role: user.role, type: 'access' },
      user.id
    );
    const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role, type: 'refresh' });
    await storeRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: toUserResponseDto(user) };
  }

  async logout(userId?: string, refreshToken?: string): Promise<void> {
    if (userId) await revokeAccessToken(userId);        // Evict from Redis immediately
    if (refreshToken) await deleteRefreshToken(refreshToken); // Revoke DB refresh token
  }

  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('User with this email does not exist', 404, ErrorCode.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const ttlSeconds = 15 * 60;

    const resetData = JSON.stringify({ userId: user.id, email: normalizedEmail, token: hashedToken });
    await redis.set(`reset_token:${normalizedEmail}`, resetData, 'EX', ttlSeconds);
    await redis.set(`reset_token_lookup:${hashedToken}`, normalizedEmail, 'EX', ttlSeconds);

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await emailQueue.add('password-reset', {
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Token expires in 15 minutes.</p>`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const email = await redis.get(`reset_token_lookup:${hashedToken}`);
    if (!email) throw new AppError('Invalid or expired reset token', 400, ErrorCode.BAD_REQUEST);

    const resetDataStr = await redis.get(`reset_token:${email}`);
    if (!resetDataStr) throw new AppError('Invalid or expired reset token', 400, ErrorCode.BAD_REQUEST);

    const { userId, token: storedToken } = JSON.parse(resetDataStr);
    if (storedToken !== hashedToken) throw new AppError('Invalid or expired reset token', 400, ErrorCode.BAD_REQUEST);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(userId, hashedPassword);

    await redis.del(`reset_token_lookup:${hashedToken}`);
    await redis.del(`reset_token:${email}`);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    return toUserResponseDto(user);
  }
}

export const authService = new AuthService();
