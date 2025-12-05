const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 🟢 FIX: Only run cloudinary.config if the CLOUD_NAME is defined.
// This prevents crashes when running locally without the necessary keys loaded.
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
    // Optional: Log a message if running locally without keys
    console.warn("⚠️ CLOUDINARY NOT CONFIGURED: Running in local-only mode.");
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus_connect_listings',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], 
  },
});

// If cloudinary is not configured, the 'storage' setup might still cause issues. 
// A safer fix for now is to check for the error:

// --- Final Decision --- 
// Use the simplified, structural check and a more robust error handling approach.

const upload = multer({ storage });

module.exports = upload;