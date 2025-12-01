const User = require('../models/User');

/**
 * @desc    Save/unsave listing
 * @route   PUT /api/users/save/:listingId
 * @access  Private
 */
const toggleSaveListing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.listingId;

    // Check if listing is already saved
    const index = user.savedListings.indexOf(listingId);

    if (index > -1) {
      // Remove from saved
      user.savedListings.splice(index, 1);
      await user.save();
      res.json({ message: 'Listing unsaved', saved: false });
    } else {
      // Add to saved
      user.savedListings.push(listingId);
      await user.save();
      res.json({ message: 'Listing saved', saved: true });
    }
  } catch (error) {
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
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleSaveListing, getSavedListings, updateProfile };