const Listing = require('../models/Listing');
const User = require('../models/User');

/**
 * @desc    Get all listings
 * @route   GET /api/listings
 * @access  Public
 */
const getAllListings = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Search functionality (optional)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 }) // Newest first
      .lean(); // Convert to plain JavaScript objects for better performance

    res.status(200).json(listings);
  } catch (error) {
    console.error('Get All Listings Error:', error);
    res.status(500).json({ message: 'Server error while fetching listings', error: error.message });
  }
};

/**
 * @desc    Get single listing by ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email phoneNumber whatsapp');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error('Get Listing By ID Error:', error);
    
    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
    }
    
    res.status(500).json({ message: 'Server error while fetching listing', error: error.message });
  }
};

/**
 * @desc    Create new listing
 * @route   POST /api/listings
 * @access  Private (Authenticated users only)
 */
const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, imageUrl } = req.body;

    // Validation - Check required fields
    if (!title || !description || price === undefined || !category || !condition) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: title, description, price, category, and condition' 
      });
    }

    // Validate price
    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // Validate category
    const validCategories = ['Textbooks', 'Notes', 'Hostel Supplies', 'Tutoring Services'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }

    // Validate condition
    const validConditions = ['New', 'Like New', 'Good', 'Fair', 'N/A'];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({ 
        message: `Invalid condition. Must be one of: ${validConditions.join(', ')}` 
      });
    }

    // Create listing with authenticated user as seller
    const listing = new Listing({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      imageUrl: imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
      seller: req.user._id, // From auth middleware
      status: 'available'
    });

    const savedListing = await listing.save();
    
    // Populate seller info before sending response
    await savedListing.populate('seller', 'name email');

    res.status(201).json({
      message: 'Listing created successfully',
      listing: savedListing
    });
  } catch (error) {
    console.error('Create Listing Error:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    
    res.status(500).json({ message: 'Server error while creating listing', error: error.message });
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Private (Only owner can update)
 */
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    // Check if listing exists
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // CRITICAL: Check if user owns the listing - ONLY OWNER CAN EDIT
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own listings.' 
      });
    }

    // Validate fields if they're being updated
    const { price, category, condition } = req.body;

    if (price !== undefined && price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    if (category) {
      const validCategories = ['Textbooks', 'Notes', 'Hostel Supplies', 'Tutoring Services'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
        });
      }
    }

    if (condition) {
      const validConditions = ['New', 'Like New', 'Good', 'Fair', 'N/A'];
      if (!validConditions.includes(condition)) {
        return res.status(400).json({ 
          message: `Invalid condition. Must be one of: ${validConditions.join(', ')}` 
        });
      }
    }

    // Update listing
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { 
        new: true, // Return updated document
        runValidators: true // Run model validators
      }
    ).populate('seller', 'name email');

    res.status(200).json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    console.error('Update Listing Error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    
    res.status(500).json({ message: 'Server error while updating listing', error: error.message });
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Private (Only owner or admin can delete)
 */
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    // Check if listing exists
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // CRITICAL: Check if user owns the listing OR is admin - AUTHORIZATION
    const isOwner = listing.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own listings.' 
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: 'Listing deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('Delete Listing Error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
    }
    
    res.status(500).json({ message: 'Server error while deleting listing', error: error.message });
  }
};

/**
 * @desc    Get current user's listings
 * @route   GET /api/listings/user/mylistings
 * @access  Private
 */
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email')
      .lean();

    res.status(200).json(listings);
  } catch (error) {
    console.error('Get My Listings Error:', error);
    res.status(500).json({ message: 'Server error while fetching your listings', error: error.message });
  }
};

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
};