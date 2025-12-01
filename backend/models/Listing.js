// backend/models/Listing.js

const mongoose = require('mongoose');

// Define the Schema structure for a Listing item
const listingSchema = new mongoose.Schema({
    // 1. Seller reference (Required for ownership checks)
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this listing to the User model
        required: true,
    },
    // 2. Core Fields
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        enum: ['Textbooks', 'Notes', 'Hostel Supplies', 'Tutoring Services'], // Matches validation in controller
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Like New', 'Good', 'Fair', 'N/A'], // Matches validation in controller
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/400x300?text=No+Image',
    },
    // 3. Status for availability
    status: {
        type: String,
        default: 'available',
        enum: ['available', 'sold', 'reserved'],
    },
}, { 
    // Mongoose automatically adds 'createdAt' and 'updatedAt' fields
    timestamps: true 
});


// Compile the schema into a Model and export it
module.exports = mongoose.model('Listing', listingSchema);