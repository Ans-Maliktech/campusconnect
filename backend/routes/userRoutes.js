const express = require('express');
const {
  toggleSaveListing,
  getSavedListings,
  updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 🟢 FIX: Changed ':listingId' to ':id' to match the Controller logic
router.put('/save/:id', protect, toggleSaveListing);

// Get all saved items
router.get('/saved', protect, getSavedListings);

// ⚠️ NOTE: Ensure 'updateProfile' exists in your userController, 
// otherwise comment this line out to prevent a crash.
router.put('/profile', protect, updateProfile);

module.exports = router;