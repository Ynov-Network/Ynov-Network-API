import type { Response } from 'express';
import type { UploadMediaRequest } from './request-types';
import MediaModel from '@/db/schemas/media';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const uploadMedia = async (req: UploadMediaRequest, res: Response) => {
  const userId = req.auth?.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded.' });
    return;
  }

  try {
    // Upload file to Cloudinary from buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ynetwork_media', // Folder in Cloudinary
        resource_type: 'auto', // Automatically detect image or video
      },
      async (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          res.status(500).json({ message: 'Failed to upload media.' });
          return;
        }

        // Create a new media document in our database
        const newMedia = new MediaModel({
          uploader_id: userId,
          file_path: result.public_id,
          cdn_url: result.secure_url,
          file_type: result.resource_type,
          file_name: req.file?.originalname,
          file_size: result.bytes,
        });

        await newMedia.save();

        res.status(201).json({
          message: 'Media uploaded successfully',
          media: newMedia,
        });
      }
    );

    // Pipe the file buffer from multer into the Cloudinary upload stream
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Internal server error while uploading media.' });
  }
}; 