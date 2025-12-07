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
    // 🟢 UPDATED: Removed 'enum' to allow new Medical categories
    category: {
        type: String,
        required: true,
    },
    // 🟢 UPDATED: Removed 'enum' to allow new Condition types
    condition: {
        type: String,
        required: true,
    },
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
        // Kept enum here for safety, but you can remove it if you want more cities
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
        expires: 864000 // 10 days
    }
}, { 
    timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);