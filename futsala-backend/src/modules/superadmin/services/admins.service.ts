import { superAdminAdminsRepository } from '../repositories/admins.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { buildCursorPage, CursorPaginationParams } from '../utils/pagination';

export class SuperAdminAdminsService {
  async listAdmins(params: CursorPaginationParams & { search?: string }) {
    const admins = await superAdminAdminsRepository.listAdmins(params);
    return buildCursorPage(admins, params.limit);
  }

  async createAdmin(data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) {
    if (!data.fullName || !data.email || !data.password) {
      throw new AppError('Missing required fields', 400, ErrorCode.BAD_REQUEST);
    }

    const existing = await superAdminAdminsRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already in use', 400, ErrorCode.CONFLICT);
    }

    return superAdminAdminsRepository.create(data);
  }

  async updateAdmin(
    id: string,
    data: { fullName?: string; phoneNumber?: string; password?: string }
  ) {
    return superAdminAdminsRepository.update(id, data);
  }

  async deleteAdmin(id: string) {
    return superAdminAdminsRepository.delete(id);
  }
}

export const superAdminAdminsService = new SuperAdminAdminsService();
