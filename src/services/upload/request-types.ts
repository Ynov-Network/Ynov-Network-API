import type { Request } from "express";

export interface UploadMediaRequest extends Request {
  file?: Express.Multer.File;
} 