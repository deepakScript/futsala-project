import cloudinary from '../../../utils/cloudinary';
import { adminVenueRepository } from '../repositories/venues.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

export class AdminUploadService {
  async uploadVenueImage(file: Express.Multer.File | undefined, venueId: string, ownerId: string) {
    if (!file || !venueId) {
      throw new AppError('Missing file or venueId', 400, ErrorCode.BAD_REQUEST);
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'futsala/venues', resource_type: 'auto' },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error);
          else resolve(uploadResult as { secure_url: string });
        }
      );
      uploadStream.end(file.buffer);
    });

    await adminVenueRepository.pushImage(venueId, ownerId, result.secure_url);

    return result.secure_url;
  }
}

export const adminUploadService = new AdminUploadService();
