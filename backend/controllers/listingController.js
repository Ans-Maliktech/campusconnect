const Listing = require('../models/Listing');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

/**
 * @desc    Get all listings with Pagination & Filtering
 * @route   GET /api/listings
 * @access  Public
 */
const getAllListings = async (req, res) => {
  try {
    const { category, status, search, city, university, page = 1, limit = 9 } = req.query;
    
    let filter = {};
    
    // Smart Filtering Logic
    if (category && category !== 'All') {
        filter.category = category;
    }

    if (status) {
        filter.status = status;
    }
    
    // Location Filters (AND Logic)
    if (city && city !== 'All') {
        filter.city = city;
    }

    // Smart University Filter (Handles dropdown & manual search)
    if (university && university !== 'All' && university !== '') {
        filter.university = { $regex: university, $options: 'i' }; 
    }
    
    // Text Search (Title, Description OR University)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } } 
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Listing.countDocuments(filter);

    res.status(200).json({
      listings,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
    });
  } catch (error) {
    console.error('Get All Listings Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    res.status(200).json(listing);
  } catch (error) {
    console.error('Get Listing By ID Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching listing', error: error.message });
  }
};

/**
 * @desc    Create new listing
 * @route   POST /api/listings
 * @access  Private
 */
const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, city, university } = req.body;

    // Validation
    if (!title || !description || price === undefined || !category || !condition || !city || !university) {
      return res.status(400).json({ 
        message: 'Please provide all required fields including Category, Condition, City and University' 
      });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // 🟢 UPDATED: Flexible Category & Condition (No hardcoded checks)
    // The Frontend controls the exact strings now.

    let imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
    
    if (req.file) {
      try {
        console.log('📤 Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
        console.log('✅ Cloudinary URL:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
      }
    }

    // Create listing
    const listing = new Listing({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category, 
      condition,
      city,
      university: university.trim(),
      image: imageUrl,
      seller: req.user._id,
      status: 'available'
    });

    const savedListing = await listing.save();
    await savedListing.populate('seller', 'name email');

    res.status(201).json({ 
      message: 'Listing created successfully', 
      listing: savedListing 
    });
  } catch (error) {
    console.error('Create Listing Error:', error);
    res.status(500).json({ 
      message: 'Server error while creating listing', 
      error: error.message 
    });
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Private
 */
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Authorization check
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own listings.' 
      });
    }

    const updates = { ...req.body };

    if (req.file) {
      try {
        console.log('📤 Updating image on Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        updates.image = result.secure_url;
        console.log('✅ New Cloudinary URL:', updates.image);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed during update:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload new image' 
        });
      }
    }

    if (updates.price !== undefined && updates.price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // Trim text fields if present
    if (updates.title) updates.title = updates.title.trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.university) updates.university = updates.university.trim();

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    res.status(200).json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    console.error('Update Listing Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
    }
    res.status(500).json({ 
      message: 'Server error while updating listing', 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Private
 */
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Authorization check - Owner or Admin
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
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
    }
    res.status(500).json({ 
      message: 'Server error while deleting listing', 
      error: error.message 
    });
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
    res.status(500).json({ 
      message: 'Server error while fetching your listings', 
      error: error.message 
    });
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