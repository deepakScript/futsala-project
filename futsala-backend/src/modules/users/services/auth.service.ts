import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories/auth.repository';
import { toUserResponseDto, UserResponseDto } from '../dtos/user.dto';
import { AppError, ErrorCode } from '../../../utils/customError';
import { sendEmail } from '../../../utils/sendMail';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';

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
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email is already registered', 400, ErrorCode.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await authRepository.createUser({
      ...data,
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
    const user = await authRepository.findByEmail(email);
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
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
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
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User with this email does not exist', 404, ErrorCode.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await authRepository.createPasswordResetToken({
      userId: user.id,
      token: hashedToken,
      expiresAt,
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Token expires in 15 minutes.</p>`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await authRepository.findPasswordResetToken(hashedToken);

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400, ErrorCode.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(resetRecord.userId, hashedPassword);
    await authRepository.deletePasswordResetToken(resetRecord.id);
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
      process.env.JWT_ACCESS_SECRET || 'your-default-secret-key',
      { expiresIn: '1d' }
    );
  }

  private generateRefreshToken(userId: string, email: string, role: UserRole): string {
    return jwt.sign(
      { userId, email, role, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );
  }
}

export const authService = new AuthService();
