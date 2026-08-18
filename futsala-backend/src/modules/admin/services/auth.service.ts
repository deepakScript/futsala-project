import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { adminAuthRepository } from '../repositories/auth.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { signAdminToken, cookieOptions } from '../../../utils/jwt';
import { emailQueue } from '../../../utils/email/email.queue';
import env from '../../../config/env.config';

export interface AdminLoginDto {
  email: string;
  password: string;
}

export class AdminAuthService {
  async login(dto: AdminLoginDto) {
    const { email, password } = dto;

    if (!email || !password) {
      throw new AppError('Missing fields', 400, ErrorCode.BAD_REQUEST);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await adminAuthRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('Invalid credentials', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await adminAuthRepository.comparePassword(password, user.password);
    if (!isPasswordValid || user.role !== 'TENANT_ADMIN') {
      throw new AppError('Invalid credentials', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    const token = signAdminToken({ id: user.id, email: user.email, role: user.role });

    return {
      token,
      cookieOptions,
      user: { id: user.id, name: user.fullName, email: user.email },
    };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await adminAuthRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('User with this email does not exist', 404, ErrorCode.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await adminAuthRepository.createPasswordResetToken({
      userId: user.id,
      token: hashedToken,
      expiresAt,
    });

    const resetUrl = `${env.CLIENT_URL}/admin/reset-password?token=${resetToken}`;
    await emailQueue.add('password-reset', {
      to: user.email,
      subject: 'Admin Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your admin password. Token expires in 15 minutes.</p>`,
    });
  }
}

export const adminAuthService = new AdminAuthService();

export class AdminProfileService {
  async getProfile(adminId: string) {
    const { adminAuthRepository: repo } = await import('../repositories/auth.repository');
    const user = await repo.findById(adminId);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    const { default: prisma } = await import('../../../config/prismaClient');
    const venue = await prisma.venue.findFirst({ where: { ownerId: adminId } });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      venue,
    };
  }

  async updateProfile(
    adminId: string,
    data: { fullName?: string; email?: string; phoneNumber?: string }
  ) {
    const { default: prisma } = await import('../../../config/prismaClient');
    return prisma.user.update({
      where: { id: adminId },
      data,
      select: { id: true, email: true, fullName: true, phoneNumber: true },
    });
  }

  async updatePassword(adminId: string, currentPassword: string, newPassword: string) {
    const user = await adminAuthRepository.findById(adminId);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Invalid current password', 400, ErrorCode.INVALID_CREDENTIALS);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await adminAuthRepository.updatePassword(adminId, hashed);
  }
}

export const adminProfileService = new AdminProfileService();
