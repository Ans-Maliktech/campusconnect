const User = require('../models/User');
const Listing = require('../models/Listing');

/**
 * @desc    Save/unsave listing (Toggle Heart)
 * @route   PUT /api/users/save/:id
 * @access  Private
 */
const toggleSaveListing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id; // 🟢 Matches route parameter '/:id'

    // Check if listing is already saved
    // We convert ObjectIds to strings to ensure accurate comparison
    const index = user.savedListings.findIndex(id => id.toString() === listingId);

    if (index > -1) {
      // Remove from saved
      user.savedListings.splice(index, 1);
      await user.save();
      
      // 🟢 RETURN savedListings so Frontend updates immediately
      res.json({ 
        message: 'Listing unsaved', 
        saved: false, 
        savedListings: user.savedListings 
      });
    } else {
      // Add to saved
      user.savedListings.push(listingId);
      await user.save();
      
      // 🟢 RETURN savedListings
      res.json({ 
        message: 'Listing saved', 
        saved: true, 
        savedListings: user.savedListings 
      });
    }
  } catch (error) {
    console.error("Toggle Save Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's saved listings
 * @route   GET /api/users/saved
 * @access  Private
 */
const getSavedListings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedListings',
      populate: { path: 'seller', select: 'name email' },
    });

    res.json(user.savedListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.whatsapp = req.body.whatsapp || user.whatsapp;

      // Only update email if it's different and not taken
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = req.body.email;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        whatsapp: updatedUser.whatsapp,
        role: updatedUser.role, // Added role just in case
      });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleSaveListing, getSavedListings, updateProfile };