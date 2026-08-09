import { userRepository } from '../repositories/user.repository';
import { toUserResponseDto } from '../dtos/user.dto';
import { AppError, ErrorCode } from '../../../utils/customError';

export class UserService {
  async getProfile(userId: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }
    return toUserResponseDto(user);
  }

  async updateProfile(
    userId: string,
    data: { fullName?: string; phoneNumber?: string; email?: string }
  ) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const updateData: { fullName?: string; phoneNumber?: string; email?: string } = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.email !== undefined) updateData.email = data.email;

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No fields provided for update', 400, ErrorCode.BAD_REQUEST);
    }

    const updatedUser = await userRepository.updateProfile(userId, updateData);
    return toUserResponseDto(updatedUser);
  }

  async deleteAccount(userId: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    return userRepository.deleteAccount(userId);
  }
}

export const userService = new UserService();
