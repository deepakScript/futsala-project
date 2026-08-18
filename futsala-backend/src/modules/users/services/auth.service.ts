import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories/auth.repository';
import { toUserResponseDto, UserResponseDto } from '../dtos/user.dto';
import { AppError, ErrorCode } from '../../../utils/customError';
import { redis } from '../../../config/redis';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import env from '../../../config/env.config';
import { emailQueue } from '../../../utils/email/email.queue';

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

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.id, user.email, user.role);

    return {
      user: toUserResponseDto(user),
      accessToken,
      refreshToken,
    };
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

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.id, user.email, user.role);

    return {
      user: toUserResponseDto(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(token: string): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    try {
      const decoded = jwt.verify(
        token,
        env.JWT_REFRESH_SECRET
      ) as { userId: string; email: string; role: UserRole };

      const user = await authRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
      }

      const newAccessToken = this.generateAccessToken(user.id, user.email, user.role);
      const newRefreshToken = this.generateRefreshToken(user.id, user.email, user.role);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: toUserResponseDto(user),
      };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, ErrorCode.UNAUTHORIZED);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('User with this email does not exist', 404, ErrorCode.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const ttlSeconds = 15 * 60; // 15 mins (900 seconds)

    // Store in Redis according to email
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

    if (!email) {
      throw new AppError('Invalid or expired reset token', 400, ErrorCode.BAD_REQUEST);
    }

    const resetDataStr = await redis.get(`reset_token:${email}`);
    if (!resetDataStr) {
      throw new AppError('Invalid or expired reset token', 400, ErrorCode.BAD_REQUEST);
    }

    const { userId, token: storedToken } = JSON.parse(resetDataStr);

    if (storedToken !== hashedToken) {
      throw new AppError('Invalid or expired reset token', 400, ErrorCode.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(userId, hashedPassword);

    // Delete token from Redis
    await redis.del(`reset_token_lookup:${hashedToken}`);
    await redis.del(`reset_token:${email}`);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }
    return toUserResponseDto(user);
  }

  private generateAccessToken(userId: string, email: string, role: UserRole): string {
    return jwt.sign(
      { userId, email, role, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1d' }
    );
  }

  private generateRefreshToken(userId: string, email: string, role: UserRole): string {
    return jwt.sign(
      { userId, email, role, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }
}

export const authService = new AuthService();
