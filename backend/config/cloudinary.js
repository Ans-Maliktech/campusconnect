const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');
require('dotenv').config();

// 1. Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured successfully");
} else {
  console.warn("⚠️ CLOUDINARY NOT CONFIGURED: Falling back to local disk storage");
}

// 2. Use memory storage and upload to Cloudinary manually
const storage = multer.memoryStorage();

// 3. Configure Multer
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// 4. Helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'campus_connect_listings') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

module.exports = { upload, uploadToCloudinary };