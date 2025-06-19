import multer from 'multer';
import path from 'path';

const memoryStorage = multer.memoryStorage();

const fileFilter = (filetypes: RegExp) => (req: any, file: any, cb: any) => {
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(`Error: File upload only supports the following filetypes - ${filetypes}`));
};

export const imageUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter(/jpeg|jpg|png|gif/),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const videoUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter(/mp4|mov|avi/),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const mediaUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter(/jpeg|jpg|png|gif|mp4|mov|avi/),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export default mediaUpload; 