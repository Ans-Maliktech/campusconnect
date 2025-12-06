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
    // 🟢 CHANGED: imageUrl → image
    image: {
        type: String,
        default: 'https://via.placeholder.com/400x300?text=No+Image',
    },
    status: {
        type: String,
        default: 'available',
        enum: ['available', 'sold', 'reserved'],
    },
    
    city: {
        type: String,
        required: true,
        enum: ['Abbottabad', 'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Rawalpindi', 'Other'],
    },
    university: {
        type: String,
        required: true,
        trim: true,
    },

    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 864000 // 10 days in seconds
    }
}, { 
    timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);