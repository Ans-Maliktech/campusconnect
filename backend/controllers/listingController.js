const Listing = require('../models/Listing');
const User = require('../models/User');

/**
 * @desc    Get all listings
 * @route   GET /api/listings
 * @access  Public
 */
/**
 * @desc    Get all listings with Pagination & Filtering
 * @route   GET /api/listings
 * @access  Public
 */
const getAllListings = async (req, res) => {
  try {
    // 🟢 Added 'city' and 'university' to query params
    const { category, status, search, city, university, page = 1, limit = 9 } = req.query;
    
    let filter = {};
    
    if (category && category !== 'All') filter.category = category;
    if (status) filter.status = status;
    
    // 🟢 NEW: Location Filters
    if (city && city !== 'All') filter.city = city;
    if (university) filter.university = { $regex: university, $options: 'i' }; // Fuzzy search for Uni
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
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
    // 🟢 Extract new fields
    const { title, description, price, category, condition, city, university } = req.body;

    let finalImageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    } else if (req.body.imageUrl) {
      finalImageUrl = req.body.imageUrl;
    }

    // 🟢 Add City/Uni to Validation
    if (!title || !description || price === undefined || !category || !condition || !city || !university) {
      return res.status(400).json({ 
        message: 'Please provide all required fields including City and University' 
      });
    }

    if (price < 0) return res.status(400).json({ message: 'Price cannot be negative' });

    // (Keep your existing Category/Condition validation arrays here)
    const validCategories = ['Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 'Tutoring Services', 'Freelancing Services', 'Other'];
    if (!validCategories.includes(category)) return res.status(400).json({ message: `Invalid category` });

    const listing = new Listing({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      city,       // 🟢 Save City
      university, // 🟢 Save Uni
      imageUrl: finalImageUrl, 
      seller: req.user._id,
      status: 'available'
    });

    const savedListing = await listing.save();
    await savedListing.populate('seller', 'name email');

    res.status(201).json({ message: 'Listing created', listing: savedListing });
  } catch (error) {
    // (Keep error handling)
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own listings.' });
    }

    // 🟢 HANDLE UPDATES
    const updates = { ...req.body };

    // If a NEW file is uploaded, verify and use it
    if (req.file && req.file.path) {
      console.log("📂 Update Listing - New File:", req.file.path);
      updates.imageUrl = req.file.path;
    }

    // Validation checks
    if (updates.price !== undefined && updates.price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    if (updates.category) {
      const validCategories = ['Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 'Tutoring Services', 'Freelancing Services', 'Other'];
      if (!validCategories.includes(updates.category)) return res.status(400).json({ message: 'Invalid category' });
    }

    if (updates.condition) {
      const validConditions = ['New', 'Like New', 'Good', 'Fair', 'N/A'];
      if (!validConditions.includes(updates.condition)) return res.status(400).json({ message: 'Invalid condition' });
    }

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
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
    res.status(500).json({ message: 'Server error while updating listing', error: error.message });
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

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const isOwner = listing.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own listings.' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Listing deleted successfully', deletedId: req.params.id });
  } catch (error) {
    console.error('Delete Listing Error:', error);
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Listing not found - Invalid ID format' });
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