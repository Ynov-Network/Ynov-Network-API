import multer from 'multer';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Create the multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit for files
  },
  fileFilter: (req, file, cb) => {
    // Basic file type validation (images and videos)
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

export default upload; 