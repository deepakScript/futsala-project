import { superAdminAuthRepository } from '../repositories/auth.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { signSuperAdminToken, cookieOptions } from '../../../utils/jwt';

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

    const token = signSuperAdminToken({ userId: user.id, email: user.email, role: user.role });

    return {
      token,
      cookieOptions,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }
}

export const superAdminAuthService = new SuperAdminAuthService();
