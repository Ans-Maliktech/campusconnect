const express = require('express');
const {
  toggleSaveListing,
  getSavedListings,
  updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/save/:listingId', protect, toggleSaveListing);
router.get('/saved', protect, getSavedListings);
router.put('/profile', protect, updateProfile);

module.exports = router;