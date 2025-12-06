const express = require('express');
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

// 🟢 UPDATED: Import both upload and uploadToCloudinary
const { upload, uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);

// Protected routes
router.post('/', protect, upload.single('image'), createListing);
router.put('/:id', protect, upload.single('image'), updateListing);
router.delete('/:id', protect, deleteListing);

// 🟢 IMPORTANT: Move this route BEFORE '/:id' to avoid conflicts
router.get('/user/mylistings', protect, getMyListings);

module.exports = router;