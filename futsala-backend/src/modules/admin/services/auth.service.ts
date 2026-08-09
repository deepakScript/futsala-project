import bcrypt from 'bcryptjs';
import { adminAuthRepository } from '../repositories/auth.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { signAdminToken, cookieOptions } from '../../../utils/jwt';

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

    const user = await adminAuthRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await adminAuthRepository.comparePassword(password, user.password);
    if (!isPasswordValid || user.role !== 'VENUE_OWNER') {
      throw new AppError('Invalid credentials', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    const token = signAdminToken({ id: user.id, email: user.email, role: user.role });

    return {
      token,
      cookieOptions,
      user: { id: user.id, name: user.fullName, email: user.email },
    };
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
