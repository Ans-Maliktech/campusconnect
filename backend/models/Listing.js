const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
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
        enum: [
            'Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 
            'Tutoring Services', 'Freelancing Services', 'Other'
        ], 
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Like New', 'Good', 'Fair', 'N/A'], 
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/400x300?text=No+Image',
    },
    status: {
        type: String,
        default: 'available',
        enum: ['available', 'sold', 'reserved'],
    },
    
    // 🟢 NEW: Location Fields
    city: {
        type: String,
        required: true,
        // Common student cities in Pakistan (You can expand this)
        enum: ['Abbottabad', 'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Rawalpindi', 'Other'],
    },
    university: {
        type: String,
        required: true,
        trim: true, // e.g., "Comsats", "NUST", "UET"
    },

    // 🟢 NEW: Auto-Delete after 10 Days
    // MongoDB will automatically delete this document when 'createdAt' is older than 10 days
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 864000 // 10 days in seconds (60*60*24*10)
    }
}, { 
    timestamps: true // This still manages updatedAt automatically
});

module.exports = mongoose.model('Listing', listingSchema);