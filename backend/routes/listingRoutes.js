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

// 🟢 NEW: Import the upload configuration
const upload = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);

// Protected routes
// 🟢 NEW: Add 'upload.single("image")' to the create route
// This tells the server: "Expect a file named 'image' in this request"
router.post('/', protect, upload.single('image'), createListing);

router.put('/:id', protect,upload.single('image'), updateListing);
router.delete('/:id', protect, deleteListing);
router.get('/user/mylistings', protect, getMyListings);

module.exports = router;