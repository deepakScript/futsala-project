import { Response } from "express";
import cloudinary from "../../../utils/cloudinary";
import prisma from "../../../config/prismaClient";
import { Request } from "express";

export const uploadVenueImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const venueId = req.body.venueId as string;

    if (!file || !venueId) {
      return res.status(400).json({ message: "Missing file or venueId" });
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "futsala/venues", resource_type: "auto" },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error);
          else resolve(uploadResult as { secure_url: string });
        }
      );
      uploadStream.end(file.buffer);
    });

    await prisma.venue.update({
      where: { id: venueId, ownerId: req.venueOwner!.id },
      data: { images: { push: result.secure_url } },
    });

    return res.json({
      url: result.secure_url,
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};
