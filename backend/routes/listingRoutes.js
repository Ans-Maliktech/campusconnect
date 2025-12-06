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
router.get('/', getAllListings);
router.get('/user/mylistings', protect, getMyListings);

// Public routes
router.get('/:id', getListingById);

// Protected routes
router.post('/', protect, upload.single('image'), createListing);
router.put('/:id', protect, upload.single('image'), updateListing);
router.delete('/:id', protect, deleteListing);

// 🟢 IMPORTANT: Move this route BEFORE '/:id' to avoid conflicts

module.exports = router;